"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Handshake, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { DebtModal } from "@/components/modals/debt-modal";
import { api, Debt } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

export default function DebtsPage() {
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [filterType, setFilterType] = useState<"Semua" | "Utang" | "Piutang">("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const data = await api.getDebts();
      setDebts(data);
    } catch (err) {
      console.error("Gagal memuat catatan utang:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, person: string) => {
    if (!window.confirm(`Hapus catatan utang piutang dengan ${person}?`)) return;
    try {
      await api.deleteDebt(id);
      setDebts((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus");
    }
  };

  // KPIs
  const totalUtang = debts.filter((d) => d.type === "Utang").reduce((acc, d) => acc + d.amount, 0);
  const totalPiutang = debts.filter((d) => d.type === "Piutang").reduce((acc, d) => acc + d.amount, 0);
  const sisaUtang = debts.filter((d) => d.type === "Utang" && d.status !== "Lunas").reduce((acc, d) => acc + (d.amount - d.installment_paid), 0);
  const sisaPiutang = debts.filter((d) => d.type === "Piutang" && d.status !== "Lunas").reduce((acc, d) => acc + (d.amount - d.installment_paid), 0);

  const filteredDebts = debts.filter((d) => {
    if (filterType === "Semua") return true;
    return d.type === filterType;
  });

  return (
    <PageShell
      title="Catat Utang"
      subtitle="Pantau utang piutang keluarga agar tertib dan transparan"
    >
      <DebtModal open={isModalOpen} setOpen={setIsModalOpen} />

      <div className="space-y-6 w-full max-w-full min-w-0">
        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-full">
          <div className="bg-surface-card p-4 rounded-2xl border border-hairline min-w-0 overflow-hidden">
            <p className="text-[11px] text-mute font-bold tracking-wider uppercase mb-1.5 truncate">
              TOTAL UTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-rose-600 tabular-nums truncate tracking-tight">
              {formatRupiah(totalUtang)}
            </h3>
          </div>

          <div className="bg-surface-card p-4 rounded-2xl border border-hairline min-w-0 overflow-hidden">
            <p className="text-[11px] text-mute font-bold tracking-wider uppercase mb-1.5 truncate">
              TOTAL PIUTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-emerald-600 tabular-nums truncate tracking-tight">
              {formatRupiah(totalPiutang)}
            </h3>
          </div>

          <div className="bg-surface-card p-4 rounded-2xl border border-rose-500/30 min-w-0 overflow-hidden">
            <p className="text-[11px] text-rose-700 font-bold tracking-wider uppercase mb-1.5 truncate">
              SISA UTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-rose-600 tabular-nums truncate tracking-tight">
              {formatRupiah(sisaUtang)}
            </h3>
          </div>

          <div className="bg-surface-card p-4 rounded-2xl border border-emerald-500/30 min-w-0 overflow-hidden">
            <p className="text-[11px] text-emerald-700 font-bold tracking-wider uppercase mb-1.5 truncate">
              SISA PIUTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-emerald-600 tabular-nums truncate tracking-tight">
              {formatRupiah(sisaPiutang)}
            </h3>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full max-w-full min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1 min-w-0">
            {(["Semua", "Utang", "Piutang"] as const).map((t) => {
              const active = filterType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  aria-pressed={active}
                  className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 ${
                    active
                      ? "bg-ink text-canvas shadow-xs"
                      : "bg-surface-card text-mute hover:text-ink hover:bg-secondary-bg border border-hairline"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-full bg-primary hover:bg-primary-pressed text-primary-foreground font-bold flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.22)] transition-all shrink-0 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Catatan</span>
          </button>
        </div>

        {/* Debts List */}
        {loading ? (
          <DashboardSkeleton />
        ) : filteredDebts.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="Tidak Ada Catatan Utang"
            description="Semua catatan utang piutang keluarga tercatat rapi di sini."
            actionLabel="Tambah Catatan Utang"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDebts.map((item) => {
              const isUtang = item.type === "Utang";
              const isLunas = item.status === "Lunas";
              const sisa = item.amount - item.installment_paid;

              return (
                <div
                  key={item.id}
                  className="bg-surface-card border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-ink/20 transition-all relative overflow-hidden group min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                            isUtang
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {item.type}
                        </span>
                        <h4 className="font-bold text-ink text-sm sm:text-base truncate">
                          {item.person}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                            isLunas
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {isLunas ? (
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          {item.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.person)}
                          aria-label={`Hapus catatan utang dengan ${item.person}`}
                          className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full active:scale-90 transition-all"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-mute line-clamp-2 mb-3">
                      {item.notes || "Tidak ada catatan keterangan"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-mute block leading-none mb-1">
                        Sisa Nominal
                      </span>
                      <p className="text-base sm:text-lg font-bold text-ink tabular-nums tracking-tight">
                        {formatRupiah(sisa)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-mute block leading-none mb-1">
                        Total Pokok
                      </span>
                      <p className="text-xs font-semibold text-mute tabular-nums">
                        {formatRupiah(item.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
