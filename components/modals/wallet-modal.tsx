"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { X, Wallet, CreditCard } from "lucide-react";

export function WalletModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const [type, setType] = useState("bank");

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[90] backdrop-blur-sm" />
        <Drawer.Content className="bg-canvas flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[100] outline-none max-w-2xl mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.1)]">
          <div className="p-4 bg-canvas rounded-t-[32px] shrink-0 sticky top-0 z-10 border-b border-hairline">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-hairline mb-4" />
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[20px] font-bold text-ink">Tambah Rekening Baru</h2>
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
              <label className="block text-[14px] font-semibold text-ink mb-2">Tipe Rekening</label>
              <div className="flex bg-surface-card rounded-full p-1 border border-hairline">
                <button 
                  onClick={() => setType("bank")}
                  className={`flex-1 py-2 rounded-full font-bold text-[14px] transition-colors flex items-center justify-center gap-2 ${type === "bank" ? "bg-ink text-canvas shadow-sm" : "text-ink hover:bg-secondary-bg"}`}
                ><CreditCard className="w-4 h-4" /> Bank / E-Wallet</button>
                <button 
                  onClick={() => setType("cash")}
                  className={`flex-1 py-2 rounded-full font-bold text-[14px] transition-colors flex items-center justify-center gap-2 ${type === "cash" ? "bg-ink text-canvas shadow-sm" : "text-ink hover:bg-secondary-bg"}`}
                ><Wallet className="w-4 h-4" /> Uang Tunai</button>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Nama Rekening</label>
              <input 
                type="text" 
                placeholder={type === "bank" ? "BCA Utama" : "Dompet Pribadi"} 
                className="w-full bg-surface-card border border-hairline rounded-[16px] p-4 text-[16px] text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-2">Saldo Awal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-ink">Rp</span>
                <input 
                  type="number" 
                  placeholder="0" 
                  className="w-full bg-surface-card border border-hairline rounded-[16px] p-4 pl-12 text-[16px] font-bold text-ink focus:outline-none focus:border-ink transition-colors"
                />
              </div>
              <p className="text-[12px] text-mute mt-2">Saldo saat ini di rekening/dompet tersebut.</p>
            </div>
          </div>

          <div className="p-6 bg-surface-card border-t border-hairline mt-auto">
            <button className="w-full h-14 bg-ink text-canvas font-bold rounded-full text-[16px] hover:bg-ink-soft transition-colors">
              Simpan Rekening
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
