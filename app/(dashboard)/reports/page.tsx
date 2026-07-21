"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { FileText, Download, Filter } from "lucide-react";

type ViewState = "ready" | "loading" | "empty";

export default function ReportsPage() {
  const [viewState] = useState<ViewState>("ready");

  return (
    <PageShell
      title="Laporan"
      subtitle="Unduh atau bagikan laporan keuanganmu"
    >
      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={FileText}
          title="Belum Ada Laporan"
          description="Laporan akan di-generate secara otomatis setiap akhir bulan berdasarkan transaksi kamu."
          actionLabel="Buat Laporan Kustom"
          onAction={() => {}}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button className="flex-1 h-12 bg-surface-card border border-hairline rounded-[16px] text-ink font-bold flex items-center justify-center gap-2 hover:bg-secondary-bg transition-colors">
              <Filter className="w-5 h-5" /> Filter Periode
            </button>
            <button className="flex-1 h-12 bg-brand-700 text-canvas font-bold rounded-[16px] flex items-center justify-center gap-2 hover:bg-brand-900 transition-colors">
              <Download className="w-5 h-5" /> Unduh PDF
            </button>
          </div>

          <section className="bg-canvas border border-hairline rounded-[32px] p-6 md:p-8">
            <h3 className="font-bold text-[22px] text-ink mb-6">Arsip Laporan Bulanan</h3>
            <div className="space-y-4">
              {[
                { title: "Laporan Keuangan Juni 2026", date: "30 Jun 2026", status: "Siap Diunduh" },
                { title: "Laporan Keuangan Mei 2026", date: "31 Mei 2026", status: "Siap Diunduh" },
                { title: "Laporan Keuangan April 2026", date: "30 Apr 2026", status: "Siap Diunduh" },
              ].map((report, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-card rounded-[16px] gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-bg flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-ink" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-[16px]">{report.title}</p>
                      <p className="text-mute text-[14px]">{report.date}</p>
                    </div>
                  </div>
                  <button className="h-10 px-6 rounded-full bg-canvas border border-hairline text-ink font-bold hover:bg-secondary-bg transition-colors text-[14px]">
                    Unduh
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
