"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { api, Transaction } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import {
  ReceiptText,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Trash2,
  ArrowRightLeft,
  PiggyBank,
  Receipt,
  CreditCard,
  Loader2,
} from "lucide-react";

const FILTER_TYPES = [
  "Semua",
  "Pengeluaran",
  "Pemasukan",
  "Tabungan",
  "Tagihan",
  "Liabilitas",
  "Transfer",
] as const;

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedType, setSelectedType] = useState<string>("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();

    const handleRefresh = () => {
      loadTransactions();
    };
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, [selectedType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: { type?: string } = {};
      if (selectedType !== "Semua") {
        params.type = selectedType;
      }
      const data = await api.getTransactions(params);
      setTransactions(data);
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Yakin ingin menghapus catatan transaksi ini?")) return;

    try {
      setDeletingId(id);
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new CustomEvent("refresh-data"));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus transaksi");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.notes && t.notes.toLowerCase().includes(term)) ||
      (t.category_name && t.category_name.toLowerCase().includes(term)) ||
      (t.wallet_source_name && t.wallet_source_name.toLowerCase().includes(term)) ||
      (t.wallet_dest_name && t.wallet_dest_name.toLowerCase().includes(term))
    );
  });

  const getTxIcon = (type: string) => {
    switch (type) {
      case "Pemasukan":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "Pengeluaran":
        return <TrendingDown className="w-4 h-4 text-rose-600" />;
      case "Tabungan":
        return <PiggyBank className="w-4 h-4 text-blue-600" />;
      case "Tagihan":
        return <Receipt className="w-4 h-4 text-amber-600" />;
      case "Liabilitas":
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case "Transfer":
        return <ArrowRightLeft className="w-4 h-4 text-teal-600" />;
      default:
        return <ReceiptText className="w-4 h-4 text-mute" />;
    }
  };

  const getTxBg = (type: string) => {
    switch (type) {
      case "Pemasukan":
        return "bg-emerald-500/10";
      case "Pengeluaran":
        return "bg-rose-500/10";
      case "Tabungan":
        return "bg-blue-500/10";
      case "Tagihan":
        return "bg-amber-500/10";
      case "Liabilitas":
        return "bg-purple-500/10";
      case "Transfer":
        return "bg-teal-500/10";
      default:
        return "bg-secondary-bg";
    }
  };

  return (
    <PageShell
      title="Riwayat"
      subtitle="Semua catatan transaksi keuangan keluarga"
    >
      <div className="space-y-6">
        {/* Top Controls: Search Bar & Tambah Button */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
            <input
              type="text"
              placeholder="Cari transaksi atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-canvas border border-hairline rounded-full pl-11 pr-4 text-sm font-medium text-ink focus:outline-none focus:border-ink transition-colors placeholder:text-ash"
            />
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-tx-modal"))}
            className="h-11 px-5 rounded-full bg-[#e60023] hover:bg-[#cc001f] text-white font-bold flex items-center justify-center gap-2 text-sm shadow-[0_4px_14px_rgba(230,0,35,0.25)] transition-all"
          >
            <Plus className="w-4 h-4" /> Transaksi Baru
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TYPES.map((type) => {
            const active = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  active
                    ? "bg-ink text-canvas shadow-sm"
                    : "bg-surface-card text-mute hover:text-ink hover:bg-secondary-bg border border-hairline"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        {loading ? (
          <DashboardSkeleton />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Tidak Ada Transaksi"
            description={
              searchTerm
                ? `Tidak ditemukan transaksi dengan kata kunci "${searchTerm}"`
                : "Belum ada transaksi di kategori ini."
            }
            actionLabel="Catat Transaksi Sekarang"
            onAction={() => window.dispatchEvent(new CustomEvent("open-tx-modal"))}
          />
        ) : (
          <div className="bg-surface-card border border-hairline rounded-[24px] p-4 md:p-6 space-y-3">
            <div className="flex justify-between items-center px-2 pb-2 border-b border-hairline text-xs font-bold text-mute">
              <span>DAFTAR TRANSAKSI ({filteredTransactions.length})</span>
              <span>NOMINAL</span>
            </div>

            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === "Pemasukan";
                const isTransfer = tx.type === "Transfer";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 bg-canvas rounded-[16px] border border-hairline/70 hover:border-hairline transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${getTxBg(
                          tx.type
                        )} flex items-center justify-center shrink-0`}
                      >
                        {getTxIcon(tx.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-ink truncate">
                            {isTransfer
                              ? `Transfer: ${tx.wallet_source_name} → ${tx.wallet_dest_name}`
                              : tx.category_name || tx.type}
                          </p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary-bg text-mute shrink-0">
                            {tx.type}
                          </span>
                        </div>
                        <p className="text-xs text-mute truncate mt-0.5">
                          {tx.tx_date} • {tx.wallet_source_name || "Cash"}
                          {tx.notes ? ` • ${tx.notes}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <p
                        className={`font-bold text-sm md:text-base ${
                          isIncome
                            ? "text-emerald-600"
                            : isTransfer
                            ? "text-teal-600"
                            : "text-ink"
                        }`}
                      >
                        {isIncome ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
                      </p>

                      <button
                        onClick={(e) => handleDelete(tx.id, e)}
                        disabled={deletingId === tx.id}
                        title="Hapus Transaksi"
                        className="opacity-0 group-hover:opacity-100 p-2 text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                      >
                        {deletingId === tx.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
