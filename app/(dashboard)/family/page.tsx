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
        <div className="space-y-6">
          <section className="bg-canvas border border-hairline rounded-[32px] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h3 className="font-bold text-[22px] text-ink mb-2">Anggota Keluarga</h3>
              <p className="text-mute text-[14px]">2 dari 5 kuota terpakai</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="h-12 px-6 rounded-full bg-brand-700 text-canvas font-bold flex items-center gap-2 hover:bg-brand-900 transition-colors"
            >
              <Plus className="w-5 h-5" /> Undang Anggota
            </button>
          </section>

          <section className="space-y-4">
            {[
              { name: "Kamu", email: "galang@example.com", role: "Owner", icon: ShieldCheck },
              { name: "Istri", email: "istri@example.com", role: "Admin", icon: Mail },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-canvas border border-hairline rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-card flex items-center justify-center text-[20px] font-bold text-ink shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink text-[18px]">{member.name}</p>
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[12px] font-bold border border-brand-100 flex items-center gap-1">
                        <member.icon className="w-3 h-3" /> {member.role}
                      </span>
                    </div>
                    <p className="text-mute text-[14px]">{member.email}</p>
                  </div>
                </div>
                {member.role !== "Owner" && (
                  <button className="text-error font-bold text-[14px] px-4 py-2 rounded-full hover:bg-error/10 transition-colors">
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
