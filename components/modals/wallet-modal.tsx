"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { X, Wallet, CreditCard, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export function WalletModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const [type, setType] = useState("bank");
  const [walletName, setWalletName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName.trim()) {
      setErrorMsg("Nama dompet wajib diisi");
      return;
    }

    const cleanBalance = initialBalance.replace(/\D/g, "");
    const balanceNum = cleanBalance ? parseInt(cleanBalance, 10) : 0;

    setLoading(true);
    setErrorMsg("");
    try {
      await api.createWallet({
        wallet_name: walletName.trim(),
        initial_balance: balanceNum,
      });
      setWalletName("");
      setInitialBalance("");
      setOpen(false);
      window.dispatchEvent(new CustomEvent("refresh-data"));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat dompet baru");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[90] backdrop-blur-sm" />
        <Drawer.Content className="bg-canvas flex flex-col rounded-t-[32px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-[100] outline-none max-w-xl mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.1)]">
          <div className="p-4 bg-canvas rounded-t-[32px] shrink-0 sticky top-0 z-10 border-b border-hairline">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-hairline mb-4" />
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[18px] font-bold text-ink">Tambah Dompet / Rekening</h2>
              <button 
                onClick={() => setOpen(false)}
                className="w-9 h-9 bg-surface-card rounded-full flex items-center justify-center text-ink hover:bg-secondary-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mute mb-2">Tipe Rekening</label>
                <div className="flex bg-surface-card rounded-full p-1 border border-hairline">
                  <button 
                    type="button"
                    onClick={() => setType("bank")}
                    className={`flex-1 py-2 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 ${type === "bank" ? "bg-ink text-canvas shadow-sm" : "text-body hover:bg-secondary-bg"}`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Bank / E-Wallet
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType("cash")}
                    className={`flex-1 py-2 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-2 ${type === "cash" ? "bg-ink text-canvas shadow-sm" : "text-body hover:bg-secondary-bg"}`}
                  >
                    <Wallet className="w-3.5 h-3.5" /> Uang Tunai
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mute mb-1.5">Nama Rekening / Dompet</label>
                <input 
                  type="text" 
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder={type === "bank" ? "BCA Utama / GoPay" : "Dompet Tunai"} 
                  className="w-full bg-surface-card border border-hairline rounded-[14px] p-3.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mute mb-1.5">Saldo Awal</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-ink">Rp</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={initialBalance ? parseInt(initialBalance, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ""))}
                    placeholder="0" 
                    className="w-full bg-surface-card border border-hairline rounded-[14px] p-3.5 pl-10 text-sm font-bold text-ink focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-error font-semibold">{errorMsg}</p>
              )}
            </div>

            <div className="pt-4 pb-[max(env(safe-area-inset-bottom,0px),16px)] border-t border-hairline">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#e60023] hover:bg-[#cc001f] text-white font-bold rounded-[16px] text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(230,0,35,0.25)]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Dompet Baru"}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
