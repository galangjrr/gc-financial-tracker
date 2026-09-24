"use client";

import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api, Wallet, Category } from "@/lib/api";
import { getLocalISODate } from "@/lib/utils";
import {
  Calendar,
  Wallet as WalletIcon,
  ArrowRightLeft,
  FileText,
  Send,
  Check,
  ParkingCircle,
  Loader2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const PRIMARY_TABS = ["Pengeluaran", "Pemasukan", "Transfer"] as const;
const EXTRA_TABS = ["Tabungan", "Liabilitas", "Tagihan"] as const;

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

interface TransactionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TransactionModal({ open, setOpen }: TransactionModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[32px] p-6 border border-hairline bg-canvas">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-hairline">
            <DialogTitle className="font-bold text-[18px] text-ink">
              Catat Transaksi Cepat
            </DialogTitle>
          </DialogHeader>
          <FastTransactionForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-canvas border-hairline max-h-[92vh] flex flex-col">
        <DrawerHeader className="px-6 pt-3 pb-2 text-left border-b border-hairline">
          <div className="mx-auto w-10 h-1.5 rounded-full bg-hairline mb-2" />
          <DrawerTitle className="font-bold text-[17px] text-ink">
            Catat Transaksi Cepat
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-[max(env(safe-area-inset-bottom,0px),20px)]">
          <FastTransactionForm onSuccess={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function FastTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("Pengeluaran");
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [txDate, setTxDate] = useState(() => getLocalISODate());
  const [categoryId, setCategoryId] = useState("");
  const [walletSourceId, setWalletSourceId] = useState("");
  const [walletDestId, setWalletDestId] = useState("");
  const [notes, setNotes] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  // Biaya parkir opsional
  const [hasParking, setHasParking] = useState(false);
  const [parkingAmount, setParkingAmount] = useState(2000);

  // Dropdown data
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categoriesBySegment, setCategoriesBySegment] = useState<Record<string, Category[]>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [walletList, catMap] = await Promise.all([
        api.getWallets(),
        api.getCategories(),
      ]);
      setWallets(walletList);
      setCategoriesBySegment(catMap);

      // Default wallet: Cash if exists, else first
      const defaultWallet = walletList.find((w) => w.wallet_name.toLowerCase().includes("cash")) || walletList[0];
      if (defaultWallet) {
        setWalletSourceId(defaultWallet.id);
      }
      if (walletList.length > 1) {
        const otherWallet = walletList.find((w) => w.id !== defaultWallet?.id) || walletList[1];
        setWalletDestId(otherWallet.id);
      }
    } catch (err: any) {
      console.error("Gagal memuat opsi form:", err);
    }
  };

  // Sync category when tab changes
  useEffect(() => {
    if (activeTab === "Transfer") {
      setCategoryId("");
      return;
    }
    const currentCats = categoriesBySegment[activeTab] || [];
    if (currentCats.length > 0) {
      setCategoryId(currentCats[0].id);
    } else {
      setCategoryId("");
    }
  }, [activeTab, categoriesBySegment]);

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      setDisplayAmount("");
      setRawAmount(0);
      return;
    }
    const num = parseInt(clean, 10);
    setRawAmount(num);
    setDisplayAmount(num.toLocaleString("id-ID"));
  };

  const handleQuickAmount = (val: number) => {
    setRawAmount(val);
    setDisplayAmount(val.toLocaleString("id-ID"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (rawAmount <= 0) {
      setErrorMsg("Nominal transaksi harus lebih dari 0");
      return;
    }

    if (activeTab === "Transfer") {
      if (!walletSourceId || !walletDestId) {
        setErrorMsg("Pilih dompet asal dan dompet tujuan");
        return;
      }
      if (walletSourceId === walletDestId) {
        setErrorMsg("Dompet asal dan tujuan tidak boleh sama");
        return;
      }
    } else {
      if (!walletSourceId) {
        setErrorMsg("Pilih dompet sumber");
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === "Transfer") {
        await api.createTransfer({
          tx_date: txDate,
          amount: rawAmount,
          wallet_source_id: walletSourceId,
          wallet_dest_id: walletDestId,
          notes: notes.trim(),
        });
      } else {
        await api.createTransaction({
          tx_date: txDate,
          type: activeTab,
          category_id: categoryId || undefined,
          amount: rawAmount,
          wallet_source_id: walletSourceId,
          notes: notes.trim(),
        });

        // Catat parkir otomatis jika dicentang
        if (activeTab === "Pengeluaran" && hasParking && parkingAmount > 0) {
          const parkirCat = (categoriesBySegment["Pengeluaran"] || []).find((c) =>
            c.category_name.toLowerCase().includes("parkir")
          );
          await api.createTransaction({
            tx_date: txDate,
            type: "Pengeluaran",
            category_id: parkirCat?.id,
            amount: parkingAmount,
            wallet_source_id: walletSourceId,
            notes: notes ? `Parkir: ${notes}` : "Biaya Parkir",
          });
        }
      }

      setSuccessMsg("Tersimpan!");
      window.dispatchEvent(new CustomEvent("refresh-data"));

      setTimeout(() => {
        onSuccess();
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = categoriesBySegment[activeTab] || [];
  const isExtraTabActive = EXTRA_TABS.includes(activeTab as any);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1">
      {/* 1. Tipe Transaksi Ringkas: 3 Tab Utama + Tab Lainnya */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-card rounded-[18px] border border-hairline">
        {PRIMARY_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setShowMoreTabs(false);
              }}
              className={`flex-1 py-2 rounded-[14px] text-xs font-bold transition-all ${
                isActive
                  ? "bg-ink text-canvas shadow-sm"
                  : "text-mute hover:text-ink hover:bg-secondary-bg/50"
              }`}
            >
              {tab}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowMoreTabs(!showMoreTabs)}
          className={`px-3 py-2 rounded-[14px] text-xs font-bold transition-all flex items-center gap-1 ${
            isExtraTabActive
              ? "bg-ink text-canvas shadow-sm"
              : "text-mute hover:text-ink hover:bg-secondary-bg/50"
          }`}
        >
          <span>{isExtraTabActive ? activeTab : "Lainnya"}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sub menu untuk tipe Tabungan, Liabilitas, Tagihan */}
      {showMoreTabs && (
        <div className="flex gap-1.5 p-1.5 bg-secondary-bg/50 rounded-[14px] border border-hairline animate-in fade-in duration-150">
          {EXTRA_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setShowMoreTabs(false);
              }}
              className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-ink text-canvas shadow-sm"
                  : "text-body hover:bg-canvas"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* 2. Hero Input Nominal + Chip Nominal Cepat */}
      <div className="bg-surface-card p-4 rounded-[22px] border border-hairline text-center flex flex-col items-center">
        <span className="text-[10px] text-mute font-bold uppercase tracking-wider mb-1">
          Nominal
        </span>
        <div className="flex items-center justify-center gap-1.5 w-full">
          <span className="text-brand-emerald text-xl md:text-2xl font-black">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            autoFocus
            className="bg-transparent text-ink text-3xl md:text-4xl font-black w-full text-center focus:outline-none placeholder:text-ash border-none p-0"
          />
        </div>

        {/* Shortcut Chip Nominal Cepat */}
        <div className="flex gap-1.5 mt-3 w-full justify-center">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickAmount(amt)}
              className="px-2.5 py-1 bg-canvas hover:bg-secondary-bg border border-hairline rounded-full text-[11px] font-bold text-ink transition-transform active:scale-95"
            >
              +{amt >= 1000 ? `${amt / 1000}rb` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Kategori Chip 1 Ketukan (Anti Dropdown Wheel) */}
      {activeTab !== "Transfer" && currentCategories.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] text-mute font-bold uppercase tracking-wider">
              Pilih Kategori
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1 scrollbar-hide">
            {currentCategories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-ink text-canvas border-ink shadow-sm scale-[1.02]"
                      : "bg-surface-card text-body hover:bg-secondary-bg border-hairline"
                  }`}
                >
                  {c.category_name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Pilihan Dompet (Otomatis Real-time Tanpa Ribet Input Tanggal) */}
      {activeTab === "Transfer" ? (
        <div className="grid grid-cols-2 gap-2">
          {/* Dari Dompet */}
          <div className="bg-surface-card p-2.5 rounded-[16px] border border-hairline flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] bg-canvas flex items-center justify-center text-body border border-hairline shrink-0">
              <WalletIcon className="w-3.5 h-3.5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] text-mute font-bold leading-none mb-1">
                Dari Dompet
              </span>
              <select
                value={walletSourceId}
                onChange={(e) => setWalletSourceId(e.target.value)}
                className="w-full bg-transparent text-ink text-xs font-bold focus:outline-none appearance-none cursor-pointer border-none p-0 truncate"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} className="bg-canvas text-ink">
                    {w.wallet_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ke Dompet */}
          <div className="bg-surface-card p-2.5 rounded-[16px] border border-hairline flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] bg-canvas flex items-center justify-center text-body border border-hairline shrink-0">
              <ArrowRightLeft className="w-3.5 h-3.5 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] text-mute font-bold leading-none mb-1">
                Ke Dompet
              </span>
              <select
                value={walletDestId}
                onChange={(e) => setWalletDestId(e.target.value)}
                className="w-full bg-transparent text-ink text-xs font-bold focus:outline-none appearance-none cursor-pointer border-none p-0 truncate"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} className="bg-canvas text-ink">
                    {w.wallet_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="bg-surface-card p-2.5 rounded-[16px] border border-hairline flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-[10px] bg-canvas flex items-center justify-center text-body border border-hairline shrink-0">
                <WalletIcon className="w-3.5 h-3.5 text-ink" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] text-mute font-bold leading-none mb-1">
                  Pakai Dompet
                </span>
                <select
                  value={walletSourceId}
                  onChange={(e) => setWalletSourceId(e.target.value)}
                  className="w-full bg-transparent text-ink text-xs font-bold focus:outline-none appearance-none cursor-pointer border-none p-0 truncate"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-canvas text-ink">
                      {w.wallet_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCustomDate(!showCustomDate)}
              className="px-2.5 py-1.5 bg-canvas hover:bg-secondary-bg border border-hairline rounded-full text-[11px] font-semibold text-mute hover:text-ink shrink-0 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>{showCustomDate ? "Batal" : "Ganti Tanggal"}</span>
            </button>
          </div>

          {/* Opsi Ubah Tanggal Lampau (Hanya jika dibutuhkan) */}
          {showCustomDate && (
            <div className="p-2 bg-secondary-bg/40 rounded-[12px] border border-hairline flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-mute shrink-0">Tanggal Lampau:</span>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full bg-canvas text-ink text-xs font-bold p-1 rounded-[8px] border border-hairline focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Catatan Kecil + Opsi Cepat Parkir Sejajar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-surface-card px-3 py-2 rounded-[14px] border border-hairline flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-mute shrink-0" />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan kecil (opsional)..."
            className="w-full bg-transparent text-ink text-xs font-medium focus:outline-none placeholder:text-ash border-none p-0"
          />
        </div>

        {/* Tombol Cepat Parkir 2rb khusus Pengeluaran */}
        {activeTab === "Pengeluaran" && (
          <button
            type="button"
            onClick={() => setHasParking(!hasParking)}
            className={`px-3 py-2 rounded-[14px] text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
              hasParking
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-surface-card text-mute hover:text-ink border-hairline"
            }`}
          >
            <ParkingCircle className="w-3.5 h-3.5" />
            <span>+2rb</span>
          </button>
        )}
      </div>

      {/* Pesan Status */}
      {errorMsg && (
        <p className="text-xs text-error font-semibold text-center">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="text-xs text-emerald-600 font-semibold text-center flex items-center justify-center gap-1">
          <Check className="w-4 h-4" /> {successMsg}
        </p>
      )}

      {/* 6. Tombol Eksekusi Merah Selalu Kelihatan Tanpa Scroll */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#e60023] hover:bg-[#cc001f] active:scale-[0.98] text-white font-bold h-11 rounded-[16px] transition-all flex items-center justify-center gap-2 text-sm shadow-[0_4px_16px_rgba(230,0,35,0.25)]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          <>
            Sip, Catat Sekarang <Send className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
