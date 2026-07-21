"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Handshake, Plus } from "lucide-react";

import { DebtModal } from "@/components/modals/debt-modal";

type ViewState = "ready" | "loading" | "empty";
type TabState = "utang" | "diutangin";

export default function DebtsPage() {
  const [viewState] = useState<ViewState>("ready");
  const [activeTab, setActiveTab] = useState<TabState>("utang");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const utangList = [
    { name: "Andi (Temen Kantor)", desc: "Talangin makan siang", amount: "Rp 50.000", date: "Jatuh Tempo: 25 Jul 2026", type: "utang" },
    { name: "Kredit Kulkas", desc: "Cicilan bulan ke-3", amount: "Rp 450.000", date: "Jatuh Tempo: 1 Agu 2026", type: "utang" },
  ];

  const diutanginList = [
    { name: "Budi (Saudara)", desc: "Pinjam buat berobat", amount: "Rp 500.000", date: "Jatuh Tempo: Belum diset", type: "diutangin" },
    { name: "Kantor", desc: "Reimburse tiket pesawat", amount: "Rp 2.500.000", date: "Jatuh Tempo: 30 Jul 2026", type: "diutangin" },
  ];

  const currentList = activeTab === "utang" ? utangList : diutanginList;

  return (
    <PageShell
      title="Catat Utang"
      subtitle="Kelola utang dan piutang agar tidak lupa"
    >
      <DebtModal open={isModalOpen} setOpen={setIsModalOpen} />

      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={Handshake}
          title="Bebas Utang!"
          description="Bagus! Kamu tidak memiliki catatan utang atau piutang aktif saat ini."
          actionLabel="Catat Baru"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex bg-surface-card rounded-full p-1 border border-hairline">
              <button 
                onClick={() => setActiveTab("utang")}
                className={`px-6 py-2 rounded-full font-bold text-[14px] transition-colors ${
                  activeTab === "utang" ? "bg-ink text-canvas shadow-sm" : "text-ink hover:bg-secondary-bg"
                }`}
              >
                Aku Utang
              </button>
              <button 
                onClick={() => setActiveTab("diutangin")}
                className={`px-6 py-2 rounded-full font-bold text-[14px] transition-colors ${
                  activeTab === "diutangin" ? "bg-ink text-canvas shadow-sm" : "text-ink hover:bg-secondary-bg"
                }`}
              >
                Diutangin
              </button>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-secondary-bg px-4 text-[14px] font-bold text-ink hover:bg-[#c8c8c1] transition-colors"
            >
              <Plus className="w-4 h-4" /> Catat
            </button>
          </div>

          <section className="bg-canvas border border-hairline rounded-[32px] p-6 md:p-8">
            <div className="space-y-4">
              {currentList.map((debt, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-card rounded-[16px] gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeTab === "utang" ? "bg-financial-expense/10" : "bg-financial-income/10"}`}>
                      <Handshake className={`w-6 h-6 ${activeTab === "utang" ? "text-financial-expense" : "text-financial-income"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-[16px]">{debt.name}</p>
                      <p className="text-mute text-[14px]">{debt.desc} • <span className={activeTab === "utang" ? "text-financial-expense" : "text-financial-income"}>{debt.date}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold text-[18px] ${activeTab === "utang" ? "text-financial-expense" : "text-financial-income"}`}>{debt.amount}</p>
                    <button className="h-10 px-6 rounded-full bg-canvas border border-hairline text-ink font-bold hover:bg-secondary-bg transition-colors text-[14px]">
                      {activeTab === "utang" ? "Bayar" : "Tagih"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
