"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export function DebtModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const [type, setType] = useState<"Utang" | "Piutang">("Utang");
  const [person, setPerson] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim()) {
      setErrorMsg("Nama pihak atau instansi wajib diisi");
      return;
    }

    const cleanAmount = amountStr.replace(/\D/g, "");
    const amountNum = cleanAmount ? parseInt(cleanAmount, 10) : 0;
    if (amountNum <= 0) {
      setErrorMsg("Nominal harus lebih dari 0");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      await api.createDebt({
        type,
        person: person.trim(),
        amount: amountNum,
        installment_due_date: dueDate || undefined,
        notes: notes.trim(),
        status: "Belum Lunas",
        debt_date: new Date().toISOString().split("T")[0],
      });
      setPerson("");
      setAmountStr("");
      setDueDate("");
      setNotes("");
      setOpen(false);
      window.dispatchEvent(new CustomEvent("refresh-data"));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan catatan utang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-[90] backdrop-blur-sm" />
        <Drawer.Content className="bg-canvas flex flex-col rounded-t-3xl max-h-[90dvh] fixed bottom-0 left-0 right-0 z-[100] outline-none max-w-xl mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
          <div className="p-4 bg-canvas rounded-t-3xl shrink-0 border-b border-hairline">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-hairline mb-3" />
            <div className="flex justify-between items-center px-2">
              <h2 className="text-base sm:text-lg font-bold text-ink">Catat Utang / Piutang</h2>
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
                <label className="block text-xs font-semibold text-mute mb-2">Jenis Catatan</label>
                <div className="flex bg-surface-card rounded-2xl p-1 border border-hairline">
                  <button 
                    type="button"
                    onClick={() => setType("Utang")}
                    aria-pressed={type === "Utang"}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                      type === "Utang" ? "bg-ink text-canvas shadow-xs" : "text-body hover:bg-secondary-bg"
                    }`}
                  >
                    Saya Berutang
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType("Piutang")}
                    aria-pressed={type === "Piutang"}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                      type === "Piutang" ? "bg-ink text-canvas shadow-xs" : "text-body hover:bg-secondary-bg"
                    }`}
                  >
                    Orang Berutang ke Saya
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="debt-person-input" className="block text-xs font-semibold text-mute mb-1.5">
                  {type === "Utang" ? "Pemberi Pinjaman" : "Nama Peminjam"}
                </label>
                <input 
                  id="debt-person-input"
                  type="text" 
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  placeholder="Contoh: Budi Santoso / Bank" 
                  required
                  className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                />
              </div>

              <div>
                <label htmlFor="debt-amount-input" className="block text-xs font-semibold text-mute mb-1.5">
                  Nominal Pokok
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-ink">Rp</span>
                  <input 
                    id="debt-amount-input"
                    type="text" 
                    inputMode="numeric"
                    value={amountStr ? parseInt(amountStr, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
                    placeholder="0" 
                    required
                    className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 pl-10 text-sm font-bold text-ink tabular-nums focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="debt-due-date" className="block text-xs font-semibold text-mute mb-1.5">
                  Target Jatuh Tempo (Opsional)
                </label>
                <input 
                  id="debt-due-date"
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-surface-card border border-hairline rounded-2xl p-3 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="debt-notes-input" className="block text-xs font-semibold text-mute mb-1.5">
                  Keterangan Tambahan (Opsional)
                </label>
                <textarea 
                  id="debt-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan keperluan atau rincian cicilan..." 
                  rows={2}
                  className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-ink focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all resize-none placeholder:text-ash"
                />
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
                  <span>Simpan Catatan Utang</span>
                )}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
