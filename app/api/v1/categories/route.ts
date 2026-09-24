import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, messageResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;

    const { data, error } = await supabaseServer
      .from("categories")
      .select("*")
      .eq("family_id", familyId)
      .order("category_name", { ascending: true });

    if (error) {
      return errorResponse("DB_ERROR", error.message, 500);
    }

    const grouped: Record<string, any[]> = {
      Pengeluaran: [],
      Pemasukan: [],
      Tabungan: [],
      Liabilitas: [],
      Tagihan: [],
    };

    for (const cat of data || []) {
      const seg = cat.segment || "Pengeluaran";
      if (!grouped[seg]) {
        grouped[seg] = [];
      }
      grouped[seg].push({
        id: cat.id,
        family_id: cat.family_id,
        segment: cat.segment,
        category_name: cat.category_name,
        budget_target: Number(cat.budget_target) || 0,
        total_target_cumulative: Number(cat.total_target_cumulative) || 0,
        target_frequency: cat.target_frequency || "Bulanan",
        keywords: cat.keywords || [],
        icon: cat.icon || undefined,
      });
    }

    return successResponse(grouped);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.family_id || DEFAULT_FAMILY_ID;
    const categoryName = (body.category_name || "").trim();
    const segment = body.segment || "Pengeluaran";
    const budgetTarget = Number(body.budget_target) || 0;
    const targetFrequency = body.target_frequency || "Bulanan";

    if (!categoryName) {
      return errorResponse("VALIDATION_ERROR", "Nama kategori wajib diisi", 400);
    }

    const { data, error } = await supabaseServer
      .from("categories")
      .insert({
        family_id: familyId,
        category_name: categoryName,
        segment,
        budget_target: budgetTarget,
        target_frequency: targetFrequency,
        keywords: [],
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
      title: "Tambah Kategori",
      details: `Menambah kategori: ${categoryName} (${segment})`,
      amount: budgetTarget,
      source_device: "Web_App",
    });

    return messageResponse("Kategori berhasil ditambahkan", { id: data.id }, 201);
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
