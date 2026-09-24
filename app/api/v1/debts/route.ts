import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, messageResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;

    const { data, error } = await supabaseServer
      .from("debts")
      .select("*")
      .eq("family_id", familyId)
      .order("debt_date", { ascending: false });

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    return successResponse(data || []);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.family_id || DEFAULT_FAMILY_ID;
    const amount = Number(body.amount) || 0;
    const type = body.type || "Utang";
    const person = (body.person || "").trim();

    if (!person || amount <= 0) {
      return errorResponse("VALIDATION_ERROR", "Nama pihak dan nominal harus diisi", 400);
    }

    const { data, error } = await supabaseServer
      .from("debts")
      .insert({
        family_id: familyId,
        debt_date: body.debt_date || new Date().toISOString().split("T")[0],
        type,
        person,
        amount,
        notes: (body.notes || "").trim(),
        status: body.status || "Belum Lunas",
        is_installment: Boolean(body.is_installment),
        installment_due_date: body.installment_due_date || null,
        installment_duration: body.installment_duration || null,
        installment_total: Number(body.installment_total) || 0,
        installment_paid: Number(body.installment_paid) || 0,
        created_by: body.created_by || "Keluarga",
      })
      .select("id")
      .single();

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    await supabaseServer.from("activity_logs").insert({
      family_id: familyId,
      action_type: "CREATE",
      actor_name: body.created_by || "Keluarga",
      title: `Catat ${type}`,
      details: `${type} ke ${person} sebesar ${amount}`,
      amount,
      source_device: "Web_App",
    });

    return messageResponse("Catatan utang berhasil disimpan", { id: data.id }, 201);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
