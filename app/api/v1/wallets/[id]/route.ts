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
      return errorResponse("VALIDATION_ERROR", "ID dompet tidak valid", 400);
    }

    // Ambil info dompet dulu untuk log
    const { data: wallet } = await supabaseServer
      .from("wallets")
      .select("wallet_name, family_id")
      .eq("id", id)
      .single();

    const { error } = await supabaseServer
      .from("wallets")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    if (wallet) {
      await supabaseServer.from("activity_logs").insert({
        family_id: wallet.family_id || DEFAULT_FAMILY_ID,
        action_type: "DELETE",
        actor_name: "Keluarga",
        title: "Hapus Dompet",
        details: `Menghapus dompet: ${wallet.wallet_name}`,
        source_device: "Web_App",
      });
    }

    return messageResponse("Dompet berhasil dihapus");
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
