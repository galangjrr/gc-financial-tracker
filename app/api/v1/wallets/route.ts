import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, messageResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;

    const { data, error } = await supabaseServer
      .from("wallet_balances")
      .select("wallet_id, family_id, wallet_name, current_balance")
      .eq("family_id", familyId);

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    const wallets = (data || []).map((w: any) => ({
      id: w.wallet_id,
      family_id: w.family_id,
      wallet_name: w.wallet_name,
      initial_balance: 0,
      current_balance: Number(w.current_balance) || 0,
      created_at: "",
      updated_at: "",
    }));

    return successResponse(wallets);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.family_id || DEFAULT_FAMILY_ID;
    const walletName = (body.wallet_name || "").trim();
    const initialBalance = Number(body.initial_balance) || 0;

    if (!walletName) {
      return errorResponse("VALIDATION_ERROR", "Nama dompet wajib diisi", 400);
    }

    const { data, error } = await supabaseServer
      .from("wallets")
      .insert({
        family_id: familyId,
        wallet_name: walletName,
        initial_balance: initialBalance,
      })
      .select("id")
      .single();

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    // Catat ke activity logs
    await supabaseServer.from("activity_logs").insert({
      family_id: familyId,
      action_type: "CREATE",
      actor_name: "Keluarga",
      title: "Tambah Dompet",
      details: `Menambah dompet: ${walletName}`,
      amount: initialBalance,
      source_device: "Web_App",
    });

    return messageResponse("Dompet berhasil ditambahkan", { id: data.id }, 201);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
