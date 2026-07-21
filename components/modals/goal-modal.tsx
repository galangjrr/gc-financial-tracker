"use client";

import React from "react";
import { Drawer } from "vaul";
import { X, Target } from "lucide-react";

export function GoalModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[90] backdrop-blur-sm" />
        <Drawer.Content className="bg-canvas flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[100] outline-none max-w-2xl mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.1)]">
          <div className="p-4 bg-canvas rounded-t-[32px] shrink-0 sticky top-0 z-10 border-b border-hairline">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-hairline mb-4" />
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[20px] font-bold text-ink">Buat Target Nabung</h2>
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
              <label className="block text-[14px] font-semibold text-ink mb-2">Ikon Target</label>
              <button className="w-16 h-16 rounded-[16px] bg-surface-card flex items-center justify-center text-ink border border-hairline hover:bg-secondary-bg transition-colors">
                <Target className="w-6 h-6" />
              </button>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Nama Target</label>
              <input 
                type="text" 
                placeholder="Contoh: Liburan ke Jepang" 
                className="w-full bg-surface-card border border-hairline rounded-[16px] p-4 text-[16px] text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Total Dana yang Dibutuhkan</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ink">Rp</span>
                <input 
                  type="number" 
                  placeholder="0" 
                  className="w-full bg-surface-card border border-hairline rounded-[16px] p-4 pl-12 text-[16px] font-bold text-ink focus:outline-none focus:border-ink transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Target Tanggal Tercapai (Opsional)</label>
              <input 
                type="date" 
                className="w-full bg-surface-card border border-hairline rounded-[16px] p-4 text-[16px] text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          </div>

          <div className="p-6 bg-surface-card border-t border-hairline mt-auto">
            <button className="w-full h-14 bg-brand-700 text-canvas font-bold rounded-full text-[16px] hover:bg-brand-900 transition-colors">
              Simpan Target
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
