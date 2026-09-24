import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;
    const actionType = searchParams.get("action_type");

    let query = supabaseServer
      .from("activity_logs")
      .select("*")
      .eq("family_id", familyId);

    if (actionType && actionType !== "Semua") {
      query = query.eq("action_type", actionType);
    }

    query = query.order("created_at", { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    return successResponse(data || []);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
