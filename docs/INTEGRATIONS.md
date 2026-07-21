# INTEGRATIONS.md — Third-Party Services & Edge Functions Architecture
> System: **GC Financial Tracker**  
> Runtime Environment: **Supabase Edge Functions (Deno TypeScript)**

---

## 1. Telegram Bot & Gemini OCR Pipeline

### 1.1 Architecture & Flow Diagram

```
+----------+             +-----------------------+             +------------------------+
| Telegram |  Webhook    | Edge Function         |  HTTP REST  | Google Gemini 3.5      |
| Client   |  POST       | `telegram-webhook`    | ----------> | Flash (Vision API)     |
+----+-----+ ----------> +-----------+-----------+             +-----------+------------+
     |                       |       |                                     |
     |                       |       | Database Lookup / Insert            | Extracted JSON
     |                       |       v                                     | (Amount, Merchant,
     |                       |   +-------+                                 |  Suggested Category)
     |                       |   | Postgres| <-----------------------------+
     |                       |   +-------+
     |                       v
     | Send Message /        
     | Inline Keyboard       
     +-----------------------+
```

---

### 1.2 Edge Function Implementation Spec (`telegram-webhook`)

Location: `supabase/functions/telegram-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.1";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

serve(async (req) => {
  // 1. Verify Telegram Webhook Secret Token
  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (secretHeader !== TELEGRAM_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const update = await req.json();

  // 2. Parse Message Context
  const message = update.message;
  if (!message) return new Response("OK", { status: 200 });

  const chatId = message.chat.id.toString();
  const text = message.text;
  const photo = message.photo;

  // 3. Resolve Family Member Tenant Context from Chat ID
  const { data: member, error: memberError } = await supabase
    .from("family_members")
    .select("family_id, user_id, display_name")
    .eq("telegram_chat_id", chatId)
    .single();

  if (memberError || !member) {
    await sendTelegramMessage(chatId, "⚠️ Akun Telegram Anda belum terhubung dengan keluarga manapun di GC Financial Tracker. Silakan hubungkan lewat menu Pengaturan di Web App.");
    return new Response("OK", { status: 200 });
  }

  // 4. Handle Text Input Processing
  if (text) {
    await processTextTransaction(chatId, text, member.family_id, member.user_id);
  } 
  // 5. Handle Receipt Photo Processing via Gemini Vision
  else if (photo && photo.length > 0) {
    const largestPhoto = photo[photo.length - 1]; // Get highest resolution
    await processReceiptPhoto(chatId, largestPhoto.file_id, member.family_id, member.user_id);
  }

  return new Response("OK", { status: 200 });
});

async function processReceiptPhoto(chatId: string, fileId: string, familyId: string, userId: string) {
  // A. Fetch photo URL from Telegram API
  const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  const filePath = fileData.result.file_path;
  const imageRes = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`);
  const imageBuffer = await imageRes.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

  // B. Call Gemini API with structured JSON output schema
  const model = genAI.getGenerativeAIModel({ model: "gemini-3.5-flash" });
  const prompt = `Analisis foto struk/kwitansi ini dan ekstrak data berikut dalam format JSON murni:
  {
    "merchant": "Nama Toko/Merchant",
    "amount": nominal_angka_tanpa_titik_komma,
    "date": "YYYY-MM-DD",
    "notes": "Ringkasan barang yang dibeli"
  }`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
  ]);

  const responseText = result.response.text();
  const cleanedJsonStr = responseText.replace(/```json|```/g, "").trim();
  const extracted = JSON.parse(cleanedJsonStr);

  // C. Insert transaction with 'pending_review' status
  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({
      family_id: familyId,
      tx_date: extracted.date || new Date().toISOString().split('T')[0],
      type: "Pengeluaran",
      amount: extracted.amount,
      notes: `[OCR] ${extracted.merchant}: ${extracted.notes}`,
      status: "pending_review",
      source_device: "Telegram_Bot",
      created_by: userId
    })
    .select()
    .single();

  if (error) {
    await sendTelegramMessage(chatId, "❌ Gagal menyimpan hasil OCR struk.");
    return;
  }

  // D. Reply to Telegram with confirmation Inline Keyboard
  const caption = `🧾 *Struk Terdeteksi (Pending Review)*\n\n` +
    `• Merchant: *${extracted.merchant}*\n` +
    `• Nominal: *Rp ${extracted.amount.toLocaleString("id-ID")}*\n` +
    `• Tanggal: *${extracted.date}*\n\n` +
    `Konfirmasi transaksi ini?`;

  await sendTelegramKeyboard(chatId, caption, [
    [{ text: "✅ Konfirmasi", callback_data: `confirm_${tx.id}` }, { text: "❌ Batalkan", callback_data: `void_${tx.id}` }]
  ]);
}

async function sendTelegramMessage(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
  });
}

async function sendTelegramKeyboard(chatId: string, text: string, keyboard: any) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard }
    })
  });
}
```

---

## 2. Payment Gateway Lifecycle Integration (Midtrans / Xendit)

### 2.1 Midtrans Webhook Handler Specification (`payment-webhook`)

Location: `supabase/functions/payment-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const payload = await req.json();

    // 1. Verify SHA512 Signature String
    // Signature Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const rawSignature = `${payload.order_id}${payload.status_code}${payload.gross_amount}${MIDTRANS_SERVER_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawSignature);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (computedSignature !== payload.signature_key) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 403 });
    }

    // 2. Extract Order Metadata (Order ID format: SUBS-FAMILY_UUID-TIMESTAMP)
    const orderParts = payload.order_id.split("-");
    const familyId = orderParts[1];
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    let newStatus = "past_due";
    let periodEnd = new Date();

    // 3. Determine Subscription State based on Midtrans Transaction Status
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "accept" || !fraudStatus) {
        newStatus = "active";
        // Calculate subscription validity end date (Default 30 days)
        periodEnd.setDate(periodEnd.getDate() + 30);
      }
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      newStatus = "canceled";
    } else if (transactionStatus === "pending") {
      newStatus = "trialing";
    }

    // 4. Upsert Subscription Record
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        family_id: familyId,
        status: newStatus,
        provider: "midtrans",
        provider_customer_id: payload.customer_details?.email || null,
        provider_subscription_id: payload.transaction_id,
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "family_id" });

    if (error) {
      console.error("Failed to update subscription:", error);
      return new Response(JSON.stringify({ error: "Database update failed" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
```
