import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, messageResponse, errorResponse } from "@/lib/api-response";

function getLocalWIBDate(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  return wib.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;
    const type = searchParams.get("type");
    const walletId = searchParams.get("wallet_id");
    const month = searchParams.get("month"); // YYYY-MM
    const search = searchParams.get("search");

    let query = supabaseServer
      .from("transactions")
      .select(`
        id, family_id, tx_date, type, category_id, amount,
        wallet_source_id, wallet_dest_id, source_device, notes,
        status, created_by, created_at, legacy_id,
        categories(category_name),
        wallet_source:wallets!transactions_wallet_source_id_fkey(wallet_name),
        wallet_dest:wallets!transactions_wallet_dest_id_fkey(wallet_name)
      `)
      .eq("family_id", familyId)
      .eq("status", "confirmed")
      .is("deleted_at", null);

    if (type && type !== "Semua") {
      query = query.eq("type", type);
    }

    if (walletId && walletId !== "Semua") {
      query = query.or(`wallet_source_id.eq.${walletId},wallet_dest_id.eq.${walletId}`);
    }

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [yStr, mStr] = month.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const startDate = `${month}-01`;
      let nextY = y;
      let nextM = m + 1;
      if (nextM > 12) {
        nextY += 1;
        nextM = 1;
      }
      const endDate = `${nextY}-${String(nextM).padStart(2, "0")}-01`;
      query = query.gte("tx_date", startDate).lt("tx_date", endDate);
    }

    if (search && search.trim()) {
      query = query.ilike("notes", `%${search.trim()}%`);
    }

    query = query
      .order("tx_date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    const transactions = (data || []).map((t: any) => ({
      id: t.id,
      family_id: t.family_id,
      tx_date: t.tx_date,
      type: t.type,
      category_id: t.category_id,
      category_name: t.categories?.category_name || "",
      amount: Number(t.amount) || 0,
      wallet_source_id: t.wallet_source_id,
      wallet_source_name: t.wallet_source?.wallet_name || "",
      wallet_dest_id: t.wallet_dest_id,
      wallet_dest_name: t.wallet_dest?.wallet_name || "",
      source_device: t.source_device || "Web_App",
      notes: t.notes || "",
      status: t.status,
      created_by: t.created_by || "",
      legacy_id: t.legacy_id,
      created_at: t.created_at,
    }));

    return successResponse(transactions);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.family_id || DEFAULT_FAMILY_ID;
    const amount = Number(body.amount);
    const type = body.type;
    const categoryId = body.category_id || null;
    const walletSourceId = body.wallet_source_id || null;
    const notes = (body.notes || "").trim();
    const createdBy = body.created_by || "Keluarga";
    const txDate = body.tx_date || getLocalWIBDate();

    if (!amount || amount <= 0) {
      return errorResponse("VALIDATION_ERROR", "Nominal transaksi harus lebih dari 0", 400);
    }
    if (!type) {
      return errorResponse("VALIDATION_ERROR", "Tipe transaksi wajib diisi", 400);
    }
    if (!walletSourceId) {
      return errorResponse("VALIDATION_ERROR", "Dompet sumber wajib dipilih", 400);
    }

    const { data, error } = await supabaseServer
      .from("transactions")
      .insert({
        family_id: familyId,
        tx_date: txDate,
        type,
        category_id: categoryId,
        amount,
        wallet_source_id: walletSourceId,
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

    // Ambil info nama kategori dan dompet untuk activity log yang jelas
    let catName = type;
    if (categoryId) {
      const { data: cat } = await supabaseServer
        .from("categories")
        .select("category_name")
        .eq("id", categoryId)
        .single();
      if (cat) catName = cat.category_name;
    }

    await supabaseServer.from("activity_logs").insert({
      family_id: familyId,
      action_type: "CREATE",
      actor_name: createdBy,
      title: `Catat ${type}`,
      details: `${type}: ${catName}${notes ? ` - ${notes}` : ""}`,
      amount,
      source_device: "Web_App",
    });

    return messageResponse("Transaksi berhasil disimpan", { id: data.id }, 201);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
