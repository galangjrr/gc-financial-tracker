"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Target, Plus, Shield, Plane, Wrench } from "lucide-react";

import { GoalModal } from "@/components/modals/goal-modal";

type ViewState = "ready" | "loading" | "empty";

export default function GoalsPage() {
  const [viewState] = useState<ViewState>("ready");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageShell
      title="Nabung"
      subtitle="Rencanakan target impianmu"
    >
      <GoalModal open={isModalOpen} setOpen={setIsModalOpen} />

      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={Target}
          title="Belum Ada Target"
          description="Mulai menabung untuk dana darurat, liburan, atau barang impianmu."
          actionLabel="Buat Target Nabung"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[22px] font-bold text-ink">Target Aktif</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-[14px] font-bold text-canvas hover:bg-brand-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Target Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Dana Darurat", target: "Rp 15.000.000", current: "Rp 5.000.000", pct: 33, icon: Shield },
              { title: "Liburan ke Bali", target: "Rp 5.000.000", current: "Rp 4.500.000", pct: 90, icon: Plane },
              { title: "Servis Motor", target: "Rp 1.000.000", current: "Rp 200.000", pct: 20, icon: Wrench },
            ].map((goal, i) => (
              <div key={i} className="bg-canvas border border-hairline rounded-[24px] p-6 space-y-6 flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-4 border border-hairline">
                      <goal.icon className="w-6 h-6 text-ink" />
                    </div>
                    <h4 className="font-bold text-ink text-[18px]">{goal.title}</h4>
                  </div>
                  <span className="font-bold text-brand-700 text-[18px]">{goal.pct}%</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-[14px] mb-2">
                    <span className="text-ink font-semibold">{goal.current}</span>
                    <span className="text-mute">dari {goal.target}</span>
                  </div>
                  <div className="w-full bg-secondary-bg rounded-full h-3">
                    <div className="bg-brand-700 h-3 rounded-full transition-all duration-500" style={{ width: `${goal.pct}%` }} />
                  </div>
                </div>
                
                <button className="w-full h-10 bg-surface-card rounded-[16px] text-ink font-bold hover:bg-secondary-bg transition-colors">
                  Top Up
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
