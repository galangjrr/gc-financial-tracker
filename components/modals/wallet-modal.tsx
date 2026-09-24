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
        <Drawer.Content className="bg-canvas flex flex-col rounded-t-3xl max-h-[88dvh] fixed bottom-0 left-0 right-0 z-[100] outline-none max-w-xl mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
          <div className="p-4 bg-canvas rounded-t-3xl shrink-0 border-b border-hairline">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-hairline mb-3" />
            <div className="flex justify-between items-center px-2">
              <h2 className="text-base sm:text-lg font-bold text-ink">Tambah Rekening atau Dompet</h2>
              <button 
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup jendela modal"
                className="w-9 h-9 bg-surface-card rounded-full flex items-center justify-center text-ink hover:bg-secondary-bg transition-colors active:scale-95"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 flex flex-col justify-between" noValidate>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mute mb-2">Tipe Rekening</label>
                <div className="flex bg-surface-card rounded-2xl p-1 border border-hairline">
                  <button 
                    type="button"
                    onClick={() => setType("bank")}
                    aria-pressed={type === "bank"}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      type === "bank" ? "bg-ink text-canvas shadow-xs" : "text-body hover:bg-secondary-bg"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Bank atau E-Wallet</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType("cash")}
                    aria-pressed={type === "cash"}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      type === "cash" ? "bg-ink text-canvas shadow-xs" : "text-body hover:bg-secondary-bg"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Uang Tunai</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="wallet-name-input" className="block text-xs font-semibold text-mute mb-1.5">
                  Nama Rekening atau Dompet
                </label>
                <input 
                  id="wallet-name-input"
                  type="text" 
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder={type === "bank" ? "Contoh: BCA Utama / GoPay" : "Contoh: Dompet Tunai"} 
                  required
                  className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                />
              </div>

              <div>
                <label htmlFor="wallet-initial-balance" className="block text-xs font-semibold text-mute mb-1.5">
                  Saldo Awal
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-ink">Rp</span>
                  <input 
                    id="wallet-initial-balance"
                    type="text" 
                    inputMode="numeric"
                    value={initialBalance ? parseInt(initialBalance, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ""))}
                    placeholder="0" 
                    className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 pl-10 text-sm font-bold text-ink tabular-nums focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                  />
                </div>
              </div>

              {errorMsg && (
                <div role="alert" aria-live="polite" className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="pt-4 pb-[max(env(safe-area-inset-bottom,0px),16px)] border-t border-hairline">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary-pressed active:scale-95 text-primary-foreground font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(230,0,35,0.22)] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Dompet Baru</span>
                )}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
