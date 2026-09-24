import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, messageResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;

    const { data, error } = await supabaseServer
      .from("goals")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

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
    const name = (body.name || "").trim();
    const targetAmount = Number(body.target_amount) || 0;
    const savedAmount = Number(body.saved_amount) || 0;
    const priority = body.priority || "Sedang";
    const icon = body.icon || "🎯";

    if (!name || targetAmount <= 0) {
      return errorResponse("VALIDATION_ERROR", "Nama target dan nominal target harus diisi", 400);
    }

    const { data, error } = await supabaseServer
      .from("goals")
      .insert({
        family_id: familyId,
        name,
        target_amount: targetAmount,
        saved_amount: savedAmount,
        priority,
        icon,
      })
      .select("id")
      .single();

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    await supabaseServer.from("activity_logs").insert({
      family_id: familyId,
      action_type: "CREATE",
      actor_name: "Keluarga",
      title: "Tambah Impian",
      details: `Membuat target impian: ${name} sebesar ${targetAmount}`,
      amount: targetAmount,
      source_device: "Web_App",
    });

    return messageResponse("Target impian berhasil disimpan", { id: data.id }, 201);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
