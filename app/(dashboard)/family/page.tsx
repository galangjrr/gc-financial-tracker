"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Users, Plus, ShieldCheck, Mail } from "lucide-react";

import { FamilyInviteModal } from "@/components/modals/family-invite-modal";

type ViewState = "ready" | "loading" | "empty";

export default function FamilyPage() {
  const [viewState] = useState<ViewState>("ready");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageShell
      title="Keluarga"
      subtitle="Kelola anggota dan hak akses keluarga"
    >
      <FamilyInviteModal open={isModalOpen} setOpen={setIsModalOpen} />

      {viewState === "loading" && <DashboardSkeleton />}

      {viewState === "empty" && (
        <EmptyState
          icon={Users}
          title="Mode Personal"
          description="Upgrade ke paket Keluarga untuk mengelola keuangan bersama pasangan atau anak."
          actionLabel="Upgrade Paket"
          onAction={() => {}}
        />
      )}

      {viewState === "ready" && (
        <div className="space-y-6 w-full max-w-full">
          <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 min-w-0 max-w-full overflow-hidden">
            <div>
              <h3 className="font-bold text-[18px] sm:text-[22px] text-ink mb-1 truncate">Anggota Keluarga</h3>
              <p className="text-mute text-xs sm:text-[14px]">2 dari 5 kuota terpakai</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="h-11 px-5 rounded-full bg-brand-700 text-canvas font-bold flex items-center gap-2 hover:bg-brand-900 transition-colors text-xs sm:text-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Undang Anggota
            </button>
          </section>

          <section className="space-y-3 sm:space-y-4 w-full max-w-full">
            {[
              { name: "Kamu", email: "galang@example.com", role: "Owner", icon: ShieldCheck },
              { name: "Istri", email: "istri@example.com", role: "Admin", icon: Mail },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 sm:p-4 bg-canvas border border-hairline rounded-[20px] sm:rounded-[24px] gap-3 min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-full bg-surface-card flex items-center justify-center text-base sm:text-[20px] font-bold text-ink shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-ink text-sm sm:text-[18px] truncate">{member.name}</p>
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[11px] sm:text-[12px] font-bold border border-brand-100 flex items-center gap-1">
                        <member.icon className="w-3 h-3" /> {member.role}
                      </span>
                    </div>
                    <p className="text-mute text-xs sm:text-[14px] truncate">{member.email}</p>
                  </div>
                </div>
                {member.role !== "Owner" && (
                  <button className="text-error font-bold text-xs sm:text-[14px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-error/10 transition-colors shrink-0">
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </section>
        </div>
      )}
    </PageShell>
  );
}
