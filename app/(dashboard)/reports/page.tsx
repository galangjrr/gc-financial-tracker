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
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-full">
            <button className="flex-1 h-11 sm:h-12 bg-surface-card border border-hairline rounded-[16px] text-ink font-bold flex items-center justify-center gap-2 hover:bg-secondary-bg transition-colors text-xs sm:text-sm">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" /> Filter Periode
            </button>
            <button className="flex-1 h-11 sm:h-12 bg-brand-700 text-canvas font-bold rounded-[16px] flex items-center justify-center gap-2 hover:bg-brand-900 transition-colors text-xs sm:text-sm">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Unduh PDF
            </button>
          </div>

          <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] p-4 sm:p-6 md:p-8 w-full max-w-full min-w-0 overflow-hidden">
            <h3 className="font-bold text-[18px] sm:text-[22px] text-ink mb-4 sm:mb-6 truncate">Arsip Laporan Bulanan</h3>
            <div className="space-y-3 sm:space-y-4 w-full max-w-full">
              {[
                { title: "Laporan Keuangan Juni 2026", date: "30 Jun 2026", status: "Siap Diunduh" },
                { title: "Laporan Keuangan Mei 2026", date: "31 Mei 2026", status: "Siap Diunduh" },
                { title: "Laporan Keuangan April 2026", date: "30 Apr 2026", status: "Siap Diunduh" },
              ].map((report, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-surface-card rounded-[16px] gap-3 min-w-0 max-w-full overflow-hidden">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-secondary-bg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-ink" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink text-sm sm:text-[16px] truncate">{report.title}</p>
                      <p className="text-mute text-xs sm:text-[14px]">{report.date}</p>
                    </div>
                  </div>
                  <button className="h-9 sm:h-10 px-5 sm:px-6 rounded-full bg-canvas border border-hairline text-ink font-bold hover:bg-secondary-bg transition-colors text-xs sm:text-[14px] shrink-0 self-start sm:self-auto">
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
