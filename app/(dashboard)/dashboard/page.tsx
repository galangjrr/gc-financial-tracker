"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialTrendChart } from "@/components/shared/financial-trend-chart";
import { api, DashboardSummary } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";

type ViewState = "ready" | "loading" | "empty" | "error";

export default function DashboardPage() {
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboard();

    const handleRefresh = () => {
      loadDashboard();
    };
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, []);

  const loadDashboard = async () => {
    try {
      setViewState("loading");
      const summary = await api.getDashboard();
      setData(summary);
      if (summary.wallets.length === 0 && summary.recent_transactions.length === 0) {
        setViewState("empty");
      } else {
        setViewState("ready");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memuat ringkasan keuangan");
      setViewState("error");
    }
  };

  return (
    <PageShell
      title="Beranda"
      subtitle={data?.month_label ? `Ringkasan kondisi keuangan keluarga ${data.month_label}` : "Ringkasan kondisi keuangan keluarga"}
    >
      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={LayoutDashboard}
          title="Belum Ada Data Keuangan"
          description="Mulai catat transaksi pertamamu untuk melihat ringkasan keuangan di sini."
          actionLabel="Tambah Transaksi Pertama"
          onAction={() => {
            window.dispatchEvent(new CustomEvent("open-tx-modal"));
          }}
        />
      )}

      {viewState === "error" && (
        <ErrorState
          title="Gagal Memuat Dashboard"
          message={errorMessage || "Koneksi ke backend Golang terputus. Pastikan server backend sedang berjalan."}
          onRetry={loadDashboard}
        />
      )}

      {viewState === "ready" && data && (
        <div className="space-y-6">
          {/* 4 KPI Summary Cards sesuai UI Klasik GC Finance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Kekayaan */}
            <div className="bg-surface-card p-4 rounded-[16px] border border-hairline transition-all hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1">
                TOTAL KEKAYAAN
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-ink truncate">
                {formatRupiah(data.net_worth)}
              </h3>
            </div>

            {/* Pemasukan Bulan Ini */}
            <div className="bg-surface-card p-4 rounded-[16px] border border-emerald-500/60 transition-all hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1">
                UANG MASUK BULAN INI
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-emerald-600 truncate">
                {formatRupiah(data.total_income)}
              </h3>
            </div>

            {/* Pengeluaran Bulan Ini */}
            <div className="bg-surface-card p-4 rounded-[16px] border border-rose-500/60 transition-all hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1">
                UANG KELUAR BULAN INI
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-rose-600 truncate">
                {formatRupiah(data.total_expense)}
              </h3>
            </div>

            {/* Rasio Nabung */}
            <div className="bg-surface-card p-4 rounded-[16px] border border-hairline transition-all hover:-translate-y-0.5 hover:shadow-sm">
              <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1">
                PORSI NABUNG
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-ink mb-1">
                {Math.round(data.savings_ratio)}%
              </h3>
              <div className="w-full bg-secondary-bg rounded-full h-1.5 mt-2 border border-hairline overflow-hidden">
                <div
                  className="bg-[#e60023] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(data.savings_ratio, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <section className="bg-surface-card rounded-[24px] p-6 border border-hairline">
            <div className="mb-4">
              <h3 className="text-base font-bold text-ink">Performa Bulanan</h3>
              <p className="text-xs text-mute">Pemasukan vs Pengeluaran</p>
            </div>
            <FinancialTrendChart />
          </section>

          {/* Dompet & Rekening */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink text-[18px]">
                Dompet &amp; Rekening
              </h3>
              <Link
                href="/wallets"
                className="h-9 flex items-center justify-center rounded-full bg-secondary-bg px-4 text-xs font-bold text-ink hover:bg-hairline transition-colors gap-1"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.wallets.map((w) => (
                <div
                  key={w.id}
                  className="bg-surface-card border border-hairline rounded-[16px] p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-bg flex items-center justify-center shrink-0">
                      {w.wallet_name.toLowerCase().includes("cash") ? (
                        <WalletIcon className="w-3.5 h-3.5 text-ink" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-ink" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-mute truncate">
                      {w.wallet_name}
                    </span>
                  </div>
                  <p
                    className={`text-[15px] font-bold truncate ${
                      w.current_balance < 0 ? "text-rose-600" : "text-ink"
                    }`}
                  >
                    {formatRupiah(w.current_balance)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Grid: Alokasi & Transaksi Terakhir */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alokasi Pengeluaran */}
            <section className="bg-surface-card border border-hairline rounded-[24px] p-6">
              <h3 className="font-bold text-ink text-[18px] mb-4">
                Alokasi Pengeluaran Bulan Ini
              </h3>
              <div className="space-y-4">
                {Object.entries(data.category_spend).length === 0 ? (
                  <p className="text-mute text-xs">Belum ada pengeluaran di bulan ini.</p>
                ) : (
                  Object.entries(data.category_spend).slice(0, 6).map(([category, amount]) => {
                    const pct = data.total_expense > 0 ? Math.round((amount / data.total_expense) * 100) : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-xs mb-1.5 font-semibold">
                          <span className="text-ink">{category}</span>
                          <span className="text-mute">{pct}% ({formatRupiah(amount)})</span>
                        </div>
                        <div className="w-full bg-secondary-bg rounded-full h-2">
                          <div
                            className="bg-[#e60023] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Catatan Terakhir */}
            <section className="bg-surface-card border border-hairline rounded-[24px] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-ink text-[18px]">
                    Catatan Terakhir
                  </h3>
                  <Link
                    href="/transactions"
                    className="text-xs font-bold text-ink hover:text-[#e60023] transition-colors"
                  >
                    Lihat Semua
                  </Link>
                </div>
                <div className="space-y-3">
                  {data.recent_transactions.length === 0 ? (
                    <p className="text-mute text-xs">Belum ada transaksi.</p>
                  ) : (
                    data.recent_transactions.slice(0, 6).map((tx) => {
                      const isIncome = tx.type === "Pemasukan";
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-canvas rounded-[14px] border border-hairline/60"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${
                                isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                              } flex items-center justify-center shrink-0`}
                            >
                              {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-semibold text-ink text-xs">
                                {tx.category_name || tx.type}
                              </p>
                              <p className="text-[11px] text-mute">
                                {tx.tx_date} • {tx.wallet_source_name || "Cash"}
                                {tx.notes ? ` • ${tx.notes}` : ""}
                              </p>
                            </div>
                          </div>
                          <p
                            className={`font-bold text-xs ${
                              isIncome ? "text-emerald-600" : "text-ink"
                            } text-right shrink-0 ml-3`}
                          >
                            {isIncome ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </PageShell>
  );
}
