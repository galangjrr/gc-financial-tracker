"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const ICONS = ["🎯", "🚗", "🏠", "✈️", "💻", "💍", "👶", "🎓"];

export function GoalModal({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const [name, setName] = useState("");
  const [targetAmountStr, setTargetAmountStr] = useState("");
  const [savedAmountStr, setSavedAmountStr] = useState("");
  const [priority, setPriority] = useState<"Ringan" | "Sedang" | "Tinggi">("Sedang");
  const [icon, setIcon] = useState("🎯");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama impian wajib diisi");
      return;
    }

    const cleanTarget = targetAmountStr.replace(/\D/g, "");
    const targetNum = cleanTarget ? parseInt(cleanTarget, 10) : 0;
    if (targetNum <= 0) {
      setErrorMsg("Nominal target harus lebih dari 0");
      return;
    }

    const cleanSaved = savedAmountStr.replace(/\D/g, "");
    const savedNum = cleanSaved ? parseInt(cleanSaved, 10) : 0;

    setLoading(true);
    setErrorMsg("");
    try {
      await api.createGoal({
        name: name.trim(),
        target_amount: targetNum,
        saved_amount: savedNum,
        priority,
        icon,
      });
      setName("");
      setTargetAmountStr("");
      setSavedAmountStr("");
      setOpen(false);
      window.dispatchEvent(new CustomEvent("refresh-data"));
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan target impian");
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
              <h2 className="text-base sm:text-lg font-bold text-ink">Buat Target Nabung</h2>
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
                <label className="block text-xs font-semibold text-mute mb-2">Pilih Ikon</label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all active:scale-95 border ${
                        icon === emoji
                          ? "bg-secondary-bg border-ink shadow-xs scale-105"
                          : "bg-surface-card border-hairline hover:bg-secondary-bg"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="goal-name-input" className="block text-xs font-semibold text-mute mb-1.5">
                  Nama Target Impian
                </label>
                <input 
                  id="goal-name-input"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Honda Civic FD / Liburan" 
                  required
                  className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                />
              </div>

              <div>
                <label htmlFor="goal-target-input" className="block text-xs font-semibold text-mute mb-1.5">
                  Total Dana yang Dibutuhkan
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-ink">Rp</span>
                  <input 
                    id="goal-target-input"
                    type="text" 
                    inputMode="numeric"
                    value={targetAmountStr ? parseInt(targetAmountStr, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setTargetAmountStr(e.target.value.replace(/\D/g, ""))}
                    placeholder="0" 
                    required
                    className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 pl-10 text-sm font-bold text-ink tabular-nums focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal-saved-input" className="block text-xs font-semibold text-mute mb-1.5">
                  Dana yang Sudah Terkumpul Saat Ini (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-ink">Rp</span>
                  <input 
                    id="goal-saved-input"
                    type="text" 
                    inputMode="numeric"
                    value={savedAmountStr ? parseInt(savedAmountStr, 10).toLocaleString("id-ID") : ""}
                    onChange={(e) => setSavedAmountStr(e.target.value.replace(/\D/g, ""))}
                    placeholder="0" 
                    className="w-full bg-surface-card border border-hairline rounded-2xl p-3.5 pl-10 text-sm font-bold text-ink tabular-nums focus:outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-ink transition-all placeholder:text-ash"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mute mb-1.5">Prioritas Target</label>
                <div className="flex bg-surface-card rounded-2xl p-1 border border-hairline">
                  {(["Ringan", "Sedang", "Tinggi"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={priority === p}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        priority === p ? "bg-ink text-canvas shadow-xs" : "text-body hover:bg-secondary-bg"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
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
                  <span>Simpan Target Impian</span>
                )}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
