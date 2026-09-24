import { NextRequest } from "next/server";
import { supabaseServer, DEFAULT_FAMILY_ID } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("family_id") || DEFAULT_FAMILY_ID;

    const now = new Date();
    // Gunakan zona waktu lokal WIB (UTC+7)
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const wibNow = new Date(utcTime + 7 * 3600000);

    const year = wibNow.getFullYear();
    const month = wibNow.getMonth(); // 0-indexed

    const startOfMonth = new Date(Date.UTC(year, month, 1));
    const startOfNextMonth = new Date(Date.UTC(year, month + 1, 1));

    const startDateStr = startOfMonth.toISOString().split("T")[0];
    const endDateStr = startOfNextMonth.toISOString().split("T")[0];

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthLabel = `${monthNames[month]} ${year}`;

    // Jalankan 4 query paralel
    const [walletsRes, monthlyTxRes, recentTxRes] = await Promise.all([
      // 1. Wallets & Saldo dari View
      supabaseServer
        .from("wallet_balances")
        .select("wallet_id, family_id, wallet_name, current_balance")
        .eq("family_id", familyId),

      // 2. Transaksi bulan ini untuk KPI & Alokasi Kategori
      supabaseServer
        .from("transactions")
        .select("type, amount, categories(category_name)")
        .eq("family_id", familyId)
        .eq("status", "confirmed")
        .is("deleted_at", null)
        .gte("tx_date", startDateStr)
        .lt("tx_date", endDateStr),

      // 3. 10 Transaksi Terakhir
      supabaseServer
        .from("transactions")
        .select(`
          id, family_id, tx_date, type, category_id, amount,
          wallet_source_id, wallet_dest_id, source_device, notes,
          status, created_by, created_at,
          categories(category_name),
          wallet_source:wallets!transactions_wallet_source_id_fkey(wallet_name),
          wallet_dest:wallets!transactions_wallet_dest_id_fkey(wallet_name)
        `)
        .eq("family_id", familyId)
        .eq("status", "confirmed")
        .is("deleted_at", null)
        .order("tx_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (walletsRes.error) {
      return errorResponse("DB_WALLETS_ERROR", walletsRes.error.message, 500);
    }
    if (monthlyTxRes.error) {
      return errorResponse("DB_MONTHLY_ERROR", monthlyTxRes.error.message, 500);
    }
    if (recentTxRes.error) {
      return errorResponse("DB_RECENT_ERROR", recentTxRes.error.message, 500);
    }

    // Format wallets
    const wallets = (walletsRes.data || []).map((w: any) => ({
      id: w.wallet_id,
      family_id: w.family_id,
      wallet_name: w.wallet_name,
      initial_balance: 0,
      current_balance: Number(w.current_balance) || 0,
      created_at: "",
      updated_at: "",
    }));

    const netWorth = wallets.reduce((acc, curr) => acc + curr.current_balance, 0);

    // Hitung KPI & Kategori Spend
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;
    const categorySpend: Record<string, number> = {};

    for (const tx of monthlyTxRes.data || []) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "Pemasukan") {
        totalIncome += amt;
      } else if (tx.type === "Pengeluaran") {
        totalExpense += amt;
        const catName = (tx.categories as any)?.category_name || "Lainnya";
        categorySpend[catName] = (categorySpend[catName] || 0) + amt;
      } else if (tx.type === "Tabungan") {
        totalSavings += amt;
      }
    }

    // Hitung Rasio Nabung: (Pemasukan - Pengeluaran) / Pemasukan * 100
    const netSavings = totalIncome - totalExpense;
    let savingsRatio = 0;
    if (totalIncome > 0) {
      savingsRatio = (netSavings / totalIncome) * 100;
    }

    let savingsStatus = "Normal";
    if (savingsRatio >= 20) {
      savingsStatus = "Sehat";
    } else if (savingsRatio < 0) {
      savingsStatus = "Defisit";
    }

    // Format Recent Transactions
    const recentTransactions = (recentTxRes.data || []).map((t: any) => ({
      id: t.id,
      family_id: t.family_id,
      tx_date: t.tx_date,
      type: t.type,
      category_id: t.category_id,
      category_name: t.categories?.category_name || "",
      amount: Number(t.amount) || 0,
      wallet_source_id: t.wallet_source_id,
      wallet_source_name: t.wallet_source?.wallet_name || "",
      wallet_dest_id: t.wallet_dest_id,
      wallet_dest_name: t.wallet_dest?.wallet_name || "",
      source_device: t.source_device || "Web_App",
      notes: t.notes || "",
      status: t.status,
      created_by: t.created_by || "",
      created_at: t.created_at,
    }));

    return successResponse({
      net_worth: netWorth,
      total_income: totalIncome,
      total_expense: totalExpense,
      total_savings: totalSavings,
      savings_ratio: savingsRatio,
      savings_status: savingsStatus,
      month_label: monthLabel,
      wallets,
      recent_transactions: recentTransactions,
      category_spend: categorySpend,
    });
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "Internal server error", 500);
  }
}
