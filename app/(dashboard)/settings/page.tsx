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
      <div className="max-w-2xl space-y-6 w-full max-w-full min-w-0">
        
        {/* Profile Section */}
        <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] p-5 sm:p-8 flex items-center gap-4 sm:gap-6 min-w-0 max-w-full overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-100 flex items-center justify-center shrink-0 border border-brand-500 text-brand-700 font-bold text-xl sm:text-[28px]">
            G
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg sm:text-[22px] text-ink truncate">Galang</h3>
            <p className="text-mute text-xs sm:text-[16px] mb-3 truncate">galang@example.com</p>
            <button className="h-9 sm:h-10 px-4 sm:px-6 rounded-full bg-surface-card border border-hairline text-ink font-bold hover:bg-secondary-bg transition-colors text-xs sm:text-[14px]">
              Edit Profil
            </button>
          </div>
        </section>

        {/* Menu List */}
        <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] overflow-hidden w-full max-w-full">
          {[
            { label: "Preferensi Akun", icon: User },
            { label: "Notifikasi & Pengingat", icon: Bell },
            { label: "Keamanan & Privasi", icon: Shield },
            { label: "Langganan & Tagihan", icon: CreditCard },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-surface-soft transition-colors border-b border-hairline last:border-b-0 min-w-0 gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-card flex items-center justify-center shrink-0">
                  <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-ink" />
                </div>
                <span className="font-semibold text-sm sm:text-[16px] text-ink truncate">{item.label}</span>
              </div>
              <span className="text-mute text-[18px] shrink-0">›</span>
            </button>
          ))}
        </section>

        {/* Danger Zone */}
        <section className="bg-canvas border border-hairline rounded-[24px] md:rounded-[32px] overflow-hidden mt-6 sm:mt-8 w-full max-w-full">
          <button className="w-full flex items-center p-4 sm:p-6 hover:bg-error/5 transition-colors gap-3 sm:gap-4 min-w-0">
             <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
              <LogOut className="w-4 sm:w-5 h-4 sm:h-5 text-error" />
            </div>
            <span className="font-bold text-sm sm:text-[16px] text-error truncate">Keluar Akun</span>
          </button>
        </section>

      </div>
    </PageShell>
  );
}
