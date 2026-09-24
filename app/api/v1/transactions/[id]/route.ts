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
      return errorResponse("VALIDATION_ERROR", "ID transaksi tidak valid", 400);
    }

    // Ambil info transaksi untuk activity log
    const { data: tx } = await supabaseServer
      .from("transactions")
      .select("type, amount, notes, family_id")
      .eq("id", id)
      .single();

    // Soft delete: update deleted_at
    const nowIso = new Date().toISOString();
    const { error } = await supabaseServer
      .from("transactions")
      .update({ deleted_at: nowIso })
      .eq("id", id);

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    if (tx) {
      await supabaseServer.from("activity_logs").insert({
        family_id: tx.family_id || DEFAULT_FAMILY_ID,
        action_type: "DELETE",
        actor_name: "Keluarga",
        title: `Hapus ${tx.type}`,
        details: `Menghapus transaksi: ${tx.notes || tx.type}`,
        amount: Number(tx.amount) || 0,
        source_device: "Web_App",
      });
    }

    return messageResponse("Transaksi berhasil dihapus");
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
