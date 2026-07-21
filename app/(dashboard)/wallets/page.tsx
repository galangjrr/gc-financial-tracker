"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Wallet, Plus, ArrowRightLeft, CreditCard } from "lucide-react";

import { WalletModal } from "@/components/modals/wallet-modal";

export default function WalletsPage() {
  const [viewState] = useState<"ready">("ready");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageShell
      title="Dompet & Rekening"
      subtitle="Kelola saldo dan mutasi antar rekening"
    >
      <WalletModal open={isModalOpen} setOpen={setIsModalOpen} />

      {viewState === "ready" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-canvas border border-hairline rounded-[32px] p-6 md:p-8">
            <div>
              <p className="text-mute text-[14px] font-semibold mb-2">Total Saldo Aktif</p>
              <h2 className="text-[32px] md:text-[44px] font-bold text-ink leading-none">Rp 48.250.000</h2>
            </div>
            <div className="flex gap-2">
              <button className="h-12 w-12 rounded-full bg-secondary-bg flex items-center justify-center text-ink hover:bg-[#c8c8c1] transition-colors">
                <ArrowRightLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-6 rounded-full bg-ink text-canvas font-bold flex items-center justify-center gap-2 hover:bg-ink-soft transition-colors"
              >
                <Plus className="w-5 h-5" /> Rekening
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "BCA Rekening Utama", amount: "Rp 32.100.000", type: "Bank", icon: CreditCard },
              { name: "Mandiri Tabungan", amount: "Rp 15.000.000", type: "Bank", icon: CreditCard },
              { name: "Cash / Tunai", amount: "Rp 1.150.000", type: "Tunai", icon: Wallet },
            ].map((wallet, i) => (
              <div key={i} className="bg-canvas border border-hairline rounded-[24px] p-6 flex flex-col justify-between h-40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow cursor-pointer relative overflow-hidden group">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-surface-soft flex items-center justify-center">
                    <wallet.icon className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-[16px]">{wallet.name}</h4>
                    <p className="text-mute text-[14px]">{wallet.type}</p>
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-[22px] text-ink">{wallet.amount}</p>
                </div>
                
                {/* Decoration */}
                <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                  <wallet.icon className="w-32 h-32 text-ink" />
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
    </PageShell>
  );
}
