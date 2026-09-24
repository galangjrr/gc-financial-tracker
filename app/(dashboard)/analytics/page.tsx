"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { LineChart } from "lucide-react";
import { FinancialTrendChart } from "@/components/shared/financial-trend-chart";

type ViewState = "ready" | "loading" | "empty";

export default function AnalyticsPage() {
  const [viewState] = useState<ViewState>("ready");

  return (
    <PageShell
      title="Pantau Duit"
      subtitle="Analisis tren dan statistik keuangan"
    >
      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={LineChart}
          title="Data Belum Cukup"
          description="Analisis akan muncul setelah kamu memiliki beberapa transaksi dalam bulan ini."
          actionLabel="Catat Transaksi"
          onAction={() => {}}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6">
          <FinancialTrendChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full">
            <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] p-5 sm:p-8 min-w-0 max-w-full overflow-hidden">
              <h3 className="font-semibold text-ink text-[18px] sm:text-[22px] mb-4 sm:mb-6">Ringkasan Bulan Ini</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3.5 sm:p-4 bg-surface-card rounded-[16px] min-w-0 gap-2">
                  <span className="font-semibold text-ink text-xs sm:text-sm truncate">Total Pemasukan</span>
                  <span className="font-bold text-financial-income text-xs sm:text-sm shrink-0">+Rp 12.000.000</span>
                </div>
                <div className="flex justify-between items-center p-3.5 sm:p-4 bg-surface-card rounded-[16px] min-w-0 gap-2">
                  <span className="font-semibold text-ink text-xs sm:text-sm truncate">Total Pengeluaran</span>
                  <span className="font-bold text-financial-expense text-xs sm:text-sm shrink-0">-Rp 4.500.000</span>
                </div>
                <div className="flex justify-between items-center p-3.5 sm:p-4 bg-surface-card rounded-[16px] min-w-0 gap-2">
                  <span className="font-semibold text-ink text-xs sm:text-sm truncate">Total Tabungan</span>
                  <span className="font-bold text-financial-savings text-xs sm:text-sm shrink-0">Rp 1.000.000</span>
                </div>
              </div>
            </section>
            
            <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] p-5 sm:p-8 min-w-0 max-w-full overflow-hidden">
              <h3 className="font-semibold text-ink text-[18px] sm:text-[22px] mb-4 sm:mb-6">Alokasi Top 3</h3>
              <div className="space-y-5 sm:space-y-6">
                {[
                  { label: "Makan & Minum", amount: "Rp 1.700.000", pct: 37, color: "bg-financial-expense" },
                  { label: "Cicilan Kendaraan", amount: "Rp 1.500.000", pct: 33, color: "bg-financial-bill" },
                  { label: "Transportasi", amount: "Rp 450.000", pct: 10, color: "bg-financial-expense" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[14px] mb-2 font-semibold">
                      <span className="text-ink">{item.label}</span>
                      <span className="text-mute">{item.amount} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-secondary-bg rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </PageShell>
  );
}
