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
import {
  Calendar,
  Layers,
  Wallet as WalletIcon,
  ArrowRightLeft,
  FileText,
  Send,
  X,
  Check,
  ParkingCircle,
  Loader2,
} from "lucide-react";

const TX_TABS = [
  "Pengeluaran",
  "Pemasukan",
  "Tabungan",
  "Liabilitas",
  "Tagihan",
  "Transfer",
] as const;

type TxTabType = (typeof TX_TABS)[number];

interface TransactionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TransactionModal({ open, setOpen }: TransactionModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[32px] p-6 border border-hairline bg-canvas">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-hairline">
            <DialogTitle className="font-semibold text-[18px] text-ink">
              Transaksi Baru
            </DialogTitle>
          </DialogHeader>
          <TransactionContent onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-canvas border-hairline max-h-[94vh] flex flex-col">
        <DrawerHeader className="px-6 pt-4 pb-2 text-left border-b border-hairline flex items-center justify-between">
          <DrawerTitle className="font-semibold text-[18px] text-ink">
            Transaksi Baru
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4 pb-8">
          <TransactionContent onSuccess={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function TransactionContent({ onSuccess }: { onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState<TxTabType>("Pengeluaran");
  const [displayAmount, setDisplayAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [walletSourceId, setWalletSourceId] = useState("");
  const [walletDestId, setWalletDestId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Biaya parkir (opsional)
  const [hasParking, setHasParking] = useState(false);
  const [displayParking, setDisplayParking] = useState("2.000");
  const [rawParking, setRawParking] = useState(2000);

  // Data dropdown
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

  const handleParkingChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      setDisplayParking("");
      setRawParking(0);
      return;
    }
    const num = parseInt(clean, 10);
    setRawParking(num);
    setDisplayParking(num.toLocaleString("id-ID"));
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
        // Transaksi utama
        await api.createTransaction({
          tx_date: txDate,
          type: activeTab,
          category_id: categoryId || undefined,
          amount: rawAmount,
          wallet_source_id: walletSourceId,
          notes: notes.trim(),
        });

        // Jika ada biaya parkir terpisah pada pengeluaran
        if (activeTab === "Pengeluaran" && hasParking && rawParking > 0) {
          const parkirCat = (categoriesBySegment["Pengeluaran"] || []).find((c) =>
            c.category_name.toLowerCase().includes("parkir")
          );
          await api.createTransaction({
            tx_date: txDate,
            type: "Pengeluaran",
            category_id: parkirCat?.id,
            amount: rawParking,
            wallet_source_id: walletSourceId,
            notes: notes ? `Parkir (${notes})` : "Biaya Parkir",
          });
        }
      }

      setSuccessMsg("Transaksi berhasil dicatat");
      window.dispatchEvent(new CustomEvent("refresh-data"));

      setTimeout(() => {
        onSuccess();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = categoriesBySegment[activeTab] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Tab Pilihan Segment */}
      <div className="grid grid-cols-3 gap-2">
        {TX_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 rounded-[16px] text-xs font-semibold transition-all border ${
                isActive
                  ? "bg-ink text-canvas border-ink shadow-sm"
                  : "bg-surface-card text-body hover:bg-secondary-bg border-hairline"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Box Nominal Besar */}
      <div className="bg-surface-card p-5 rounded-[20px] border border-hairline text-center flex flex-col items-center">
        <p className="text-[11px] text-mute font-semibold uppercase tracking-wider mb-2">
          MAU CATAT BERAPA?
        </p>
        <div className="flex items-center justify-center gap-2 w-full max-w-xs">
          <span className="text-brand-emerald text-2xl font-bold">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
            autoFocus
            className="bg-transparent text-ink text-3xl md:text-4xl font-extrabold w-full text-center focus:outline-none placeholder:text-ash border-none"
          />
        </div>
      </div>

      {/* Row: Kapan (Tanggal) */}
      <div className="bg-surface-card p-3.5 rounded-[16px] border border-hairline flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-secondary-bg flex items-center justify-center text-body border border-hairline shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <label className="block text-[11px] text-mute font-medium">Kapan?</label>
          <input
            type="date"
            value={txDate}
            onChange={(e) => setTxDate(e.target.value)}
            className="w-full bg-transparent text-ink text-sm font-semibold focus:outline-none border-none p-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Row: Buat Apa (Kategori) — Sembunyikan jika Transfer */}
      {activeTab !== "Transfer" && (
        <div className="bg-surface-card p-3.5 rounded-[16px] border border-hairline flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-secondary-bg flex items-center justify-center text-body border border-hairline shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-mute font-medium">Buat Apa?</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-transparent text-ink text-sm font-semibold focus:outline-none appearance-none cursor-pointer border-none p-0"
            >
              {currentCategories.length === 0 ? (
                <option value="">Tidak ada kategori</option>
              ) : (
                currentCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-canvas text-ink">
                    {c.category_name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      {/* Row: Pakai Uang Mana (Dompet Sumber) */}
      <div className="bg-surface-card p-3.5 rounded-[16px] border border-hairline flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-secondary-bg flex items-center justify-center text-body border border-hairline shrink-0">
          <WalletIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <label className="block text-[11px] text-mute font-medium">
            {activeTab === "Transfer" ? "Dari Dompet Mana?" : "Pakai Uang Mana?"}
          </label>
          <select
            value={walletSourceId}
            onChange={(e) => setWalletSourceId(e.target.value)}
            className="w-full bg-transparent text-ink text-sm font-semibold focus:outline-none appearance-none cursor-pointer border-none p-0"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id} className="bg-canvas text-ink">
                {w.wallet_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row: Ke Dompet Mana (Khusus Transfer) */}
      {activeTab === "Transfer" && (
        <div className="bg-surface-card p-3.5 rounded-[16px] border border-hairline flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-secondary-bg flex items-center justify-center text-body border border-hairline shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-mute font-medium">Ke Dompet Mana?</label>
            <select
              value={walletDestId}
              onChange={(e) => setWalletDestId(e.target.value)}
              className="w-full bg-transparent text-ink text-sm font-semibold focus:outline-none appearance-none cursor-pointer border-none p-0"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} className="bg-canvas text-ink">
                  {w.wallet_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Row: Catatan Kecil */}
      <div className="bg-surface-card p-3.5 rounded-[16px] border border-hairline flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-secondary-bg flex items-center justify-center text-body border border-hairline shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <label className="block text-[11px] text-mute font-medium">Catatan Kecil</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kasih keterangan dikit..."
            className="w-full bg-transparent text-ink text-sm font-semibold focus:outline-none placeholder:text-ash border-none p-0"
          />
        </div>
      </div>

      {/* Row: Biaya Parkir (Khusus Pengeluaran) */}
      {activeTab === "Pengeluaran" && (
        <div className="bg-surface-card p-3.5 rounded-[16px] border border-hairline">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasParking}
              onChange={(e) => setHasParking(e.target.checked)}
              className="w-4 h-4 rounded border-hairline text-primary focus:ring-primary accent-[#e60023]"
            />
            <span className="text-sm font-semibold text-ink">Ada biaya parkir?</span>
          </label>

          {hasParking && (
            <div className="mt-3 pt-3 border-t border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-secondary-bg flex items-center justify-center text-body border border-hairline shrink-0">
                <ParkingCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-brand-emerald text-sm font-bold">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayParking}
                  onChange={(e) => handleParkingChange(e.target.value)}
                  placeholder="2.000"
                  className="bg-transparent text-ink text-base font-bold focus:outline-none border-none p-0 w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pesan Error & Sukses */}
      {errorMsg && (
        <p className="text-xs text-error font-semibold text-center">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="text-xs text-emerald-600 font-semibold text-center flex items-center justify-center gap-1">
          <Check className="w-4 h-4" /> {successMsg}
        </p>
      )}

      {/* Tombol Simpan */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#e60023] hover:bg-[#cc001f] active:scale-[0.98] text-white font-bold h-12 rounded-[16px] transition-all flex items-center justify-center gap-2 text-sm shadow-[0_4px_16px_rgba(230,0,35,0.25)]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          <>
            Sip, Catat Sekarang <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
