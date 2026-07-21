"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { X, ShieldCheck, Mail } from "lucide-react";

export function FamilyInviteModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const [role, setRole] = useState("admin");

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[90] backdrop-blur-sm" />
        <Drawer.Content className="bg-canvas flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[100] outline-none max-w-2xl mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.1)]">
          <div className="p-4 bg-canvas rounded-t-[32px] shrink-0 sticky top-0 z-10 border-b border-hairline">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-hairline mb-4" />
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[20px] font-bold text-ink">Undang Anggota Keluarga</h2>
              <button 
                onClick={() => setOpen(false)}
                className="w-10 h-10 bg-surface-card rounded-full flex items-center justify-center text-ink hover:bg-secondary-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Email Anggota</label>
              <input 
                type="email" 
                placeholder="istri@example.com" 
                className="w-full bg-surface-card border border-hairline rounded-[16px] p-4 text-[16px] text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Peran Akses</label>
              <div className="space-y-3">
                <button 
                  onClick={() => setRole("admin")}
                  className={`w-full flex items-start gap-4 p-4 rounded-[16px] border transition-colors text-left ${role === "admin" ? "border-brand-700 bg-brand-50" : "border-hairline bg-surface-card hover:bg-secondary-bg"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${role === "admin" ? "bg-brand-700 text-canvas" : "bg-secondary-bg text-ink"}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-[16px]">Admin</h4>
                    <p className="text-mute text-[14px]">Bisa melihat, mencatat, dan mengubah data seluruh anggota keluarga.</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setRole("viewer")}
                  className={`w-full flex items-start gap-4 p-4 rounded-[16px] border transition-colors text-left ${role === "viewer" ? "border-brand-700 bg-brand-50" : "border-hairline bg-surface-card hover:bg-secondary-bg"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${role === "viewer" ? "bg-brand-700 text-canvas" : "bg-secondary-bg text-ink"}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-[16px]">Viewer</h4>
                    <p className="text-mute text-[14px]">Hanya bisa melihat data keuangan, tidak bisa mengubah atau mencatat.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-surface-card border-t border-hairline mt-auto">
            <button className="w-full h-14 bg-brand-700 text-canvas font-bold rounded-full text-[16px] hover:bg-brand-900 transition-colors">
              Kirim Undangan
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
