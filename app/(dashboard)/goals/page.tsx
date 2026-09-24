"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Target, Plus, Trash2 } from "lucide-react";
import { GoalModal } from "@/components/modals/goal-modal";
import { api, Goal } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error("Gagal memuat target nabung:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus target "${name}"?`)) return;
    try {
      await api.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus");
    }
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.saved_amount, 0);

  return (
    <PageShell
      title="Nabung Impian"
      subtitle="Tetapkan tujuan keuangan keluarga dan pantau progres pencapaiannya"
    >
      <GoalModal open={isModalOpen} setOpen={setIsModalOpen} />

      <div className="space-y-6 w-full max-w-full min-w-0">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-full">
          <div className="bg-surface-card p-4 rounded-2xl border border-hairline min-w-0 overflow-hidden">
            <p className="text-[11px] text-mute font-bold tracking-wider uppercase mb-1.5 truncate">
              TOTAL IMPIAN
            </p>
            <p className="text-xl sm:text-2xl font-bold text-ink tabular-nums truncate tracking-tight">{goals.length}</p>
          </div>
          <div className="bg-surface-card p-4 rounded-2xl border border-emerald-500/40 min-w-0 overflow-hidden">
            <p className="text-[11px] text-emerald-700 font-bold tracking-wider uppercase mb-1.5 truncate">
              TOTAL TARGET
            </p>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-emerald-600 tabular-nums truncate tracking-tight">
              {formatRupiah(totalTarget)}
            </p>
          </div>
          <div className="bg-surface-card p-4 rounded-2xl border border-hairline col-span-2 md:col-span-1 min-w-0 overflow-hidden">
            <p className="text-[11px] text-mute font-bold tracking-wider uppercase mb-1.5 truncate">
              TOTAL TERKUMPUL
            </p>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-ink tabular-nums truncate tracking-tight">
              {formatRupiah(totalSaved)}
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full">
          <h3 className="font-bold text-ink text-base sm:text-lg">Daftar Impian</h3>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-full bg-primary hover:bg-primary-pressed text-primary-foreground font-bold flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.22)] transition-all shrink-0 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Impian Baru</span>
          </button>
        </div>

        {/* Goals List */}
        {loading ? (
          <DashboardSkeleton />
        ) : goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Belum Ada Impian"
            description="Mulai rencanakan target tabungan impian keluargamu sekarang."
            actionLabel="Tambah Impian Baru"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = goal.target_amount > 0 ? Math.round((goal.saved_amount / goal.target_amount) * 100) : 0;

              return (
                <div
                  key={goal.id}
                  className="bg-surface-card border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-ink/20 transition-all group min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0" role="img" aria-label="Ikon impian">
                          {goal.icon || "🎯"}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-ink text-sm sm:text-base truncate">
                            {goal.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-mute uppercase tracking-wider">
                            Prioritas: {goal.priority}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id, goal.name)}
                        aria-label={`Hapus target ${goal.name}`}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full active:scale-90 transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-mute font-medium">Progres Nabung</span>
                        <span className="text-ink font-bold tabular-nums">{pct}%</span>
                      </div>
                      <div className="w-full bg-secondary-bg rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs">
                    <div>
                      <span className="text-mute block text-[11px] mb-0.5 font-medium">Terkumpul</span>
                      <p className="font-bold text-ink tabular-nums text-sm">
                        {formatRupiah(goal.saved_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-mute block text-[11px] mb-0.5 font-medium">Target Total</span>
                      <p className="font-semibold text-mute tabular-nums">
                        {formatRupiah(goal.target_amount)}
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
