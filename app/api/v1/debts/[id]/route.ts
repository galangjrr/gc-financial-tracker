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

    const { data: debt } = await supabaseServer
      .from("debts")
      .select("person, type, family_id")
      .eq("id", id)
      .single();

    const { error } = await supabaseServer
      .from("debts")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    if (debt) {
      await supabaseServer.from("activity_logs").insert({
        family_id: debt.family_id || DEFAULT_FAMILY_ID,
        action_type: "DELETE",
        actor_name: "Keluarga",
        title: `Hapus ${debt.type}`,
        details: `Menghapus catatan ${debt.type} ${debt.person}`,
        source_device: "Web_App",
      });
    }

    return messageResponse("Catatan utang berhasil dihapus");
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
