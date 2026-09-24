import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { messageResponse, errorResponse } from "@/lib/api-response";

function getLocalWIBDate(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  return wib.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.family_id || DEFAULT_FAMILY_ID;
    const amount = Number(body.amount);
    const walletSourceId = body.wallet_source_id;
    const walletDestId = body.wallet_dest_id;
    const notes = (body.notes || "").trim();
    const createdBy = body.created_by || "Keluarga";
    const txDate = body.tx_date || getLocalWIBDate();

    if (!amount || amount <= 0) {
      return errorResponse("VALIDATION_ERROR", "Nominal transfer harus lebih dari 0", 400);
    }
    if (!walletSourceId || !walletDestId) {
      return errorResponse("VALIDATION_ERROR", "Dompet asal dan tujuan wajib dipilih", 400);
    }
    if (walletSourceId === walletDestId) {
      return errorResponse("VALIDATION_ERROR", "Dompet asal dan tujuan tidak boleh sama", 400);
    }

    const { data, error } = await supabaseServer
      .from("transactions")
      .insert({
        family_id: familyId,
        tx_date: txDate,
        type: "Transfer",
        amount,
        wallet_source_id: walletSourceId,
        wallet_dest_id: walletDestId,
        source_device: "Web_App",
        notes,
        status: "confirmed",
        created_by: createdBy,
      })
      .select("id")
      .single();

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    // Ambil info nama dompet untuk activity log
    const [srcRes, destRes] = await Promise.all([
      supabaseServer.from("wallets").select("wallet_name").eq("id", walletSourceId).single(),
      supabaseServer.from("wallets").select("wallet_name").eq("id", walletDestId).single(),
    ]);

    const srcName = srcRes.data?.wallet_name || "Dompet";
    const destName = destRes.data?.wallet_name || "Dompet";

    await supabaseServer.from("activity_logs").insert({
      family_id: familyId,
      action_type: "TRANSFER",
      actor_name: createdBy,
      title: "Transfer Antar Dompet",
      details: `Transfer dari ${srcName} ke ${destName}${notes ? ` - ${notes}` : ""}`,
      amount,
      source_device: "Web_App",
    });

    return messageResponse("Transfer berhasil disimpan", { id: data.id }, 201);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
