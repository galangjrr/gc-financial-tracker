"use client";

import React from "react";
import { PageShell } from "@/components/shared/page-shell";
import { Settings, User, Bell, Shield, CreditCard, LogOut } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageShell
      title="Pengaturan"
      subtitle="Atur preferensi akun dan aplikasi"
    >
      <div className="max-w-2xl space-y-6">
        
        {/* Profile Section */}
        <section className="bg-canvas border border-hairline rounded-[32px] p-6 md:p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border border-brand-500 text-brand-700 font-bold text-[28px]">
            G
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[22px] text-ink">Galang</h3>
            <p className="text-mute text-[16px] mb-4">galang@example.com</p>
            <button className="h-10 px-6 rounded-full bg-surface-card border border-hairline text-ink font-bold hover:bg-secondary-bg transition-colors text-[14px]">
              Edit Profil
            </button>
          </div>
        </section>

        {/* Menu List */}
        <section className="bg-canvas border border-hairline rounded-[32px] overflow-hidden">
          {[
            { label: "Preferensi Akun", icon: User },
            { label: "Notifikasi & Pengingat", icon: Bell },
            { label: "Keamanan & Privasi", icon: Shield },
            { label: "Langganan & Tagihan", icon: CreditCard },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-6 hover:bg-surface-soft transition-colors border-b border-hairline last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-ink" />
                </div>
                <span className="font-semibold text-[16px] text-ink">{item.label}</span>
              </div>
              <span className="text-mute text-[18px]">›</span>
            </button>
          ))}
        </section>

        {/* Danger Zone */}
        <section className="bg-canvas border border-hairline rounded-[32px] overflow-hidden mt-8">
          <button className="w-full flex items-center p-6 hover:bg-error/5 transition-colors gap-4">
             <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-error" />
            </div>
            <span className="font-bold text-[16px] text-error">Keluar Akun</span>
          </button>
        </section>

      </div>
    </PageShell>
  );
}
