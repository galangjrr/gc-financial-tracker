import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { messageResponse, errorResponse } from "@/lib/api-response";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return errorResponse("VALIDATION_ERROR", "ID tidak valid", 400);
    }

    const { data: goal } = await supabaseServer
      .from("goals")
      .select("name, family_id")
      .eq("id", id)
      .single();

    const { error } = await supabaseServer
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    if (goal) {
      await supabaseServer.from("activity_logs").insert({
        family_id: goal.family_id || DEFAULT_FAMILY_ID,
        action_type: "DELETE",
        actor_name: "Keluarga",
        title: "Hapus Impian",
        details: `Menghapus target impian: ${goal.name}`,
        source_device: "Web_App",
      });
    }

    return messageResponse("Target impian berhasil dihapus");
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
