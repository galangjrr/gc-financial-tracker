"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { PieChart, Plus, Coffee, Car, Zap, Gamepad2 } from "lucide-react";

import { CategoryModal } from "@/components/modals/category-modal";

type ViewState = "ready" | "loading" | "empty";

export default function CategoriesPage() {
  const [viewState] = useState<ViewState>("ready");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageShell
      title="Budget & Kategori"
      subtitle="Atur batas pengeluaran bulanan"
    >
      <CategoryModal open={isModalOpen} setOpen={setIsModalOpen} />

      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={PieChart}
          title="Belum Ada Budget"
          description="Atur batas pengeluaranmu per kategori agar keuangan lebih terkontrol."
          actionLabel="Buat Budget"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[22px] font-bold text-ink">Budget Juli 2026</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-secondary-bg px-4 text-[14px] font-bold text-ink hover:bg-[#c8c8c1] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Kategori Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Makan & Minum", icon: Coffee, pct: 85, used: "Rp 1.700.000", total: "Rp 2.000.000", color: "bg-financial-expense" },
              { label: "Transportasi", icon: Car, pct: 45, used: "Rp 450.000", total: "Rp 1.000.000", color: "bg-financial-expense" },
              { label: "Tagihan Bulanan", icon: Zap, pct: 100, used: "Rp 1.500.000", total: "Rp 1.500.000", color: "bg-financial-bill" },
              { label: "Hiburan", icon: Gamepad2, pct: 15, used: "Rp 75.000", total: "Rp 500.000", color: "bg-financial-expense" },
            ].map((budget, i) => (
              <div key={i} className="bg-canvas border border-hairline rounded-[24px] p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-soft rounded-full flex items-center justify-center">
                    <budget.icon className="w-6 h-6 text-ink" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-ink text-[18px]">{budget.label}</h4>
                    <p className="text-mute text-[14px]">Terpakai {budget.used} dari {budget.total}</p>
                  </div>
                </div>
                
                <div className="w-full bg-secondary-bg rounded-full h-3">
                  <div
                    className={`${budget.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(budget.pct, 100)}%` }}
                  />
                </div>
                {budget.pct >= 100 && (
                  <p className="text-error text-[12px] font-semibold">⚠️ Budget sudah habis atau berlebih!</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
