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

      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-full">
          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-hairline min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              TOTAL GOALS
            </p>
            <p className="text-xl sm:text-2xl font-bold text-ink truncate">{goals.length}</p>
          </div>
          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-emerald-500/60 min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              TOTAL TARGET
            </p>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-emerald-600 truncate">
              {formatRupiah(totalTarget)}
            </p>
          </div>
          <div className="bg-surface-card p-3.5 sm:p-4 rounded-[16px] border border-hairline col-span-2 md:col-span-1 min-w-0 overflow-hidden">
            <p className="text-[10px] text-mute font-bold tracking-wider uppercase mb-1 truncate">
              TOTAL TERKUMPUL
            </p>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-ink truncate">
              {formatRupiah(totalSaved)}
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full">
          <h3 className="font-bold text-ink text-base">Daftar Impian</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-full bg-[#e60023] hover:bg-[#cc001f] text-white font-bold flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.2)] transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Goal Baru
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
            actionLabel="Tambah Goal Baru"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const pct = goal.target_amount > 0 ? Math.round((goal.saved_amount / goal.target_amount) * 100) : 0;
              return (
                <div
                  key={goal.id}
                  className="bg-surface-card border border-hairline rounded-[24px] p-6 space-y-4 group hover:border-hairline/90 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center text-xl shrink-0">
                        {goal.icon || "🎯"}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-base">
                          {goal.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-bg text-mute">
                          Prioritas: {goal.priority}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id, goal.name)}
                      title="Hapus Target"
                      className="opacity-0 group-hover:opacity-100 p-2 text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-semibold text-mute">Progres</span>
                      <span className="text-xs font-bold text-ink">{pct}%</span>
                    </div>
                    <div className="w-full bg-secondary-bg rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#e60023] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-hairline text-xs font-semibold">
                    <span className="text-mute">
                      Terkumpul: <strong className="text-ink">{formatRupiah(goal.saved_amount)}</strong>
                    </span>
                    <span className="text-mute">
                      Target: <strong className="text-ink">{formatRupiah(goal.target_amount)}</strong>
                    </span>
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
