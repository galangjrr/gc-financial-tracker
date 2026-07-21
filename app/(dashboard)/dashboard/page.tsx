"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { OnboardingModal } from "@/components/modals/onboarding-modal";
import { FinancialTrendChart } from "@/components/shared/financial-trend-chart";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

// Simulated view state — swap to test each state
type ViewState = "ready" | "loading" | "empty" | "error";

export default function DashboardPage() {
  const [viewState] = useState<ViewState>("ready");
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <PageShell
      title="Dashboard"
      subtitle="Ringkasan keuangan bulan ini"
    >
      {/* Modals */}
      <OnboardingModal open={onboardingOpen} setOpen={setOnboardingOpen} />

      {/* View States */}
      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={LayoutDashboard}
          title="Belum Ada Data Keuangan"
          description="Mulai catat transaksi pertamamu untuk melihat ringkasan keuangan di sini."
          actionLabel="Tambah Transaksi Pertama"
          onAction={() => {}}
        />
      )}

      {viewState === "error" && (
        <ErrorState
          title="Gagal Memuat Dashboard"
          message="Koneksi ke server terputus. Pastikan kamu terhubung ke internet lalu coba lagi."
          onRetry={() => window.location.reload()}
        />
      )}

      {viewState === "ready" && (
        <>
          {/* Net Worth Card */}
          <section className="bg-canvas text-ink rounded-[32px] p-8 md:p-10 relative overflow-hidden border border-hairline">
            <div className="relative z-10">
              <p className="text-mute text-[14px] font-semibold mb-2 tracking-wide uppercase">
                Total Kekayaan Keluarga
              </p>
              <h2 className="text-[44px] md:text-[56px] font-bold tracking-[-0.8px] leading-none">
                Rp 48.250.000
              </h2>
            </div>
            <div className="absolute right-0 bottom-0 opacity-5 translate-x-1/4 translate-y-1/4 pointer-events-none">
              <Wallet className="w-64 h-64 text-ink" />
            </div>
          </section>
          
          {/* Trend Chart */}
          <section>
            <FinancialTrendChart />
          </section>

          {/* Wallets */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink text-[22px]">
                Dompet &amp; Rekening
              </h3>
              <Link href="/wallets" className="h-10 flex items-center justify-center rounded-md bg-secondary-bg px-4 text-[14px] font-bold text-ink hover:bg-[#c8c8c1] transition-colors gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "BCA Rekening Utama", amount: "Rp 32.100.000" },
                { name: "Mandiri Tabungan", amount: "Rp 15.000.000" },
                { name: "Cash / Tunai", amount: "Rp 1.150.000" },
              ].map((w) => (
                <div
                  key={w.name}
                  className="bg-canvas border border-hairline rounded-[16px] p-6"
                >
                  <p className="text-mute text-[14px] font-semibold mb-2">
                    {w.name}
                  </p>
                  <p className="text-[22px] font-bold text-ink leading-[1.25]">
                    {w.amount}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Progress */}
            <section className="bg-canvas border border-hairline rounded-[32px] p-8">
              <h3 className="font-semibold text-ink text-[22px] mb-8">
                Budget Bulan Ini
              </h3>
              <div className="space-y-8">
                {[
                  {
                    label: "Pengeluaran Harian",
                    pct: 68,
                    color: "bg-financial-expense",
                    sisa: "Rp 1.500.000",
                    total: "Rp 4.500.000",
                  },
                  {
                    label: "Tagihan & Cicilan",
                    pct: 90,
                    color: "bg-financial-bill",
                    sisa: "Rp 200.000",
                    total: "Rp 2.000.000",
                  },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-[16px] mb-3 font-semibold">
                      <span className="text-ink">{b.label}</span>
                      <span className="text-ink">{b.pct}%</span>
                    </div>
                    <div className="w-full bg-secondary-bg rounded-full h-3">
                      <div
                        className={`${b.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <p className="text-[14px] text-mute mt-3 font-medium">
                      Sisa {b.sisa} dari {b.total}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="bg-canvas border border-hairline rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-ink text-[22px]">
                  Transaksi Terakhir
                </h3>
                <Link href="/transactions" className="h-10 flex items-center justify-center rounded-md bg-secondary-bg px-4 text-[14px] font-bold text-ink hover:bg-[#c8c8c1] transition-colors">
                  Detail
                </Link>
              </div>
              <div className="space-y-4">
                {[
                  {
                    icon: TrendingDown,
                    iconBg: "bg-financial-expense/10",
                    iconColor: "text-financial-expense",
                    name: "Makan Siang Kopi",
                    meta: "Hari ini, 12:45 • Cash",
                    amount: "-Rp 45.000",
                    amountColor: "text-ink",
                  },
                  {
                    icon: TrendingUp,
                    iconBg: "bg-financial-income/10",
                    iconColor: "text-financial-income",
                    name: "Gaji Bulanan",
                    meta: "Kemarin, 09:00 • BCA",
                    amount: "+Rp 12.000.000",
                    amountColor: "text-financial-income",
                  },
                ].map((tx) => (
                  <div
                    key={tx.name}
                    className="flex items-center justify-between p-4 bg-surface-card rounded-[16px]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full ${tx.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <tx.icon className={`w-5 h-5 ${tx.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">
                          {tx.name}
                        </p>
                        <p className="text-[14px] text-mute">{tx.meta}</p>
                      </div>
                    </div>
                    <p
                      className={`font-bold ${tx.amountColor} text-right shrink-0 ml-4`}
                    >
                      {tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </PageShell>
  );
}
