import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const pin = (body.pin || "").trim();

    if (!name || !pin) {
      return errorResponse("VALIDATION_ERROR", "Nama dan PIN wajib diisi", 400);
    }

    const { data, error } = await supabaseServer
      .from("family_members")
      .select("id, family_id, user_id, display_name, role, telegram_chat_id, created_at, updated_at")
      .ilike("display_name", name)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      return errorResponse("AUTH_FAILED", "Nama atau PIN salah", 401);
    }

    return successResponse(data);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
