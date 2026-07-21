"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { ReceiptText, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";

type ViewState = "ready" | "loading" | "empty";

export default function TransactionsPage() {
  const [viewState] = useState<ViewState>("ready");

  return (
    <PageShell
      title="Riwayat Transaksi"
      subtitle="Semua catatan keluar masuk uang"
    >
      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={ReceiptText}
          title="Belum Ada Transaksi"
          description="Kamu belum mencatat transaksi apa pun. Mulai catat sekarang!"
          actionLabel="Tambah Transaksi"
          onAction={() => {}}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ash" />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="w-full h-12 bg-canvas border border-hairline rounded-full pl-12 pr-4 text-[16px] text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>
            <button className="h-12 px-6 bg-surface-card border border-hairline rounded-full text-ink font-bold flex items-center gap-2 hover:bg-secondary-bg transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Transaction List */}
          <section className="bg-canvas border border-hairline rounded-[32px] p-6 md:p-8">
            <div className="space-y-6">
              {/* Group by Date */}
              <div>
                <h4 className="text-mute font-semibold text-[14px] mb-4">Hari Ini, 21 Juli 2026</h4>
                <div className="space-y-4">
                  {[
                    { name: "Makan Siang Kopi", icon: TrendingDown, color: "text-financial-expense", bg: "bg-financial-expense/10", amount: "-Rp 45.000", wallet: "Cash" },
                    { name: "Beli Token Listrik", icon: TrendingDown, color: "text-financial-bill", bg: "bg-financial-bill/10", amount: "-Rp 150.000", wallet: "BCA Utama" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-card rounded-[16px] hover:bg-secondary-bg transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${tx.bg} flex items-center justify-center shrink-0`}>
                          <tx.icon className={`w-6 h-6 ${tx.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-[16px] text-ink">{tx.name}</p>
                          <p className="text-[14px] text-mute">{tx.wallet}</p>
                        </div>
                      </div>
                      <p className={`font-bold text-[16px] ${tx.color} text-right shrink-0 ml-4`}>
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-mute font-semibold text-[14px] mb-4">Kemarin, 20 Juli 2026</h4>
                <div className="space-y-4">
                  {[
                    { name: "Gaji Bulanan", icon: TrendingUp, color: "text-financial-income", bg: "bg-financial-income/10", amount: "+Rp 12.000.000", wallet: "BCA Utama" },
                    { name: "Nabung Darurat", icon: TrendingDown, color: "text-financial-savings", bg: "bg-financial-savings/10", amount: "-Rp 1.000.000", wallet: "BCA ke Mandiri" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-surface-card rounded-[16px] hover:bg-secondary-bg transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${tx.bg} flex items-center justify-center shrink-0`}>
                          <tx.icon className={`w-6 h-6 ${tx.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-[16px] text-ink">{tx.name}</p>
                          <p className="text-[14px] text-mute">{tx.wallet}</p>
                        </div>
                      </div>
                      <p className={`font-bold text-[16px] ${tx.color} text-right shrink-0 ml-4`}>
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button className="h-10 px-6 rounded-full bg-surface-card text-ink font-bold hover:bg-secondary-bg transition-colors">
                Muat Lebih Banyak
              </button>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
