import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdentifier = (body.name || body.email || body.identifier || "").trim();
    const pin = (body.pin || body.password || "").trim();

    if (!rawIdentifier || !pin) {
      return errorResponse("VALIDATION_ERROR", "Nama atau Email dan PIN wajib diisi", 400);
    }

    const nameCandidate = rawIdentifier.includes("@") ? rawIdentifier.split("@")[0] : rawIdentifier;

    const { data, error } = await supabaseServer
      .from("family_members")
      .select("id, family_id, user_id, display_name, role, telegram_chat_id, created_at, updated_at")
      .or(`display_name.ilike.${nameCandidate},display_name.ilike.${rawIdentifier}`)
      .eq("pin", pin)
      .limit(1);

    if (error || !data || data.length === 0) {
      return errorResponse("AUTH_FAILED", "Nama atau PIN tidak sesuai", 401);
    }

    return successResponse(data[0]);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
