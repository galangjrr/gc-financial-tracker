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

      <div className="space-y-6">
        {/* 4 Summary Cards Klasik GC Finance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-hairline min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              TOTAL UTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-rose-600 truncate">
              {formatRupiah(totalUtang)}
            </h3>
          </div>

          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-hairline min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              TOTAL PIUTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-emerald-600 truncate">
              {formatRupiah(totalPiutang)}
            </h3>
          </div>

          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-hairline min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              SISA UTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-rose-600 truncate">
              {formatRupiah(sisaUtang)}
            </h3>
          </div>

          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-hairline min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              SISA PIUTANG
            </p>
            <h3 className="text-base sm:text-xl font-bold text-emerald-600 truncate">
              {formatRupiah(sisaPiutang)}
            </h3>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5 max-w-full min-w-0">
            {(["Semua", "Utang", "Piutang"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs shrink-0 transition-colors ${
                  filterType === t
                    ? "bg-ink text-canvas shadow-sm"
                    : "bg-surface-card text-mute hover:text-ink hover:bg-secondary-bg border border-hairline"
                }`}
              >
                {t === "Semua" ? "Semua" : `Hanya ${t}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-full bg-[#e60023] hover:bg-[#cc001f] text-white font-bold flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.2)] transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Catat Baru
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <DashboardSkeleton />
        ) : filteredDebts.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="Tidak Ada Catatan Utang"
            description="Bagus! Tidak ada catatan utang piutang aktif di kategori ini."
            actionLabel="Catat Sekarang"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredDebts.map((item) => {
              const isPiutang = item.type === "Piutang";
              const isLunas = item.status === "Lunas";

              return (
                <div
                  key={item.id}
                  className="bg-surface-card border border-hairline rounded-[20px] p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group min-w-0 max-w-full overflow-hidden"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-full ${
                        isPiutang ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      } flex items-center justify-center shrink-0 border border-hairline`}
                    >
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-ink text-base truncate">
                          {item.person}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPiutang
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.type}
                        </span>
                        {isLunas ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Lunas
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Belum Lunas
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-mute mt-1 truncate">
                        {item.debt_date} • {item.notes || "Tanpa catatan"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <p className={`font-extrabold text-base md:text-lg ${isPiutang ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatRupiah(item.amount)}
                      </p>
                      {item.installment_paid > 0 && (
                        <p className="text-[11px] text-mute">
                          Terbayar: {formatRupiah(item.installment_paid)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.person)}
                      title="Hapus Catatan"
                      className="opacity-0 group-hover:opacity-100 p-2 text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
