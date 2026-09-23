"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { Wallet as WalletIcon, Plus, ArrowRightLeft, CreditCard, Trash2, Loader2 } from "lucide-react";
import { WalletModal } from "@/components/modals/wallet-modal";
import { api, Wallet } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

export default function WalletsPage() {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadWallets();

    const handleRefresh = () => {
      loadWallets();
    };
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const data = await api.getWallets();
      setWallets(data);
    } catch (err) {
      console.error("Gagal memuat dompet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus dompet "${name}"?`)) return;

    try {
      setDeletingId(id);
      await api.deleteWallet(id);
      setWallets((prev) => prev.filter((w) => w.id !== id));
      window.dispatchEvent(new CustomEvent("refresh-data"));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus dompet");
    } finally {
      setDeletingId(null);
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.current_balance, 0);

  return (
    <PageShell
      title="Dompet"
      subtitle="Kelola saldo dan mutasi antar rekening keluarga"
    >
      <WalletModal open={isModalOpen} setOpen={setIsModalOpen} />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Header Card Saldo Aktif */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border border-hairline rounded-[24px] p-6">
            <div>
              <p className="text-mute text-xs font-bold uppercase tracking-wider mb-1">
                TOTAL SALDO AKTIF
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink leading-none">
                {formatRupiah(totalBalance)}
              </h2>
            </div>
            <div className="flex gap-2 self-start md:self-auto">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-tx-modal"))}
                className="h-10 px-4 rounded-full bg-secondary-bg hover:bg-hairline text-ink font-bold flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-10 px-5 rounded-full bg-[#e60023] hover:bg-[#cc001f] text-white font-bold flex items-center justify-center gap-2 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.2)] transition-all"
              >
                <Plus className="w-4 h-4" /> Tambah Rekening
              </button>
            </div>
          </div>

          {/* Grid Dompet */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => {
              const isCash = wallet.wallet_name.toLowerCase().includes("cash") || wallet.wallet_name.toLowerCase().includes("tunai");
              return (
                <div
                  key={wallet.id}
                  className="bg-surface-card border border-hairline rounded-[20px] p-5 flex flex-col justify-between h-36 hover:border-hairline/80 transition-all relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-canvas flex items-center justify-center border border-hairline shrink-0">
                        {isCash ? (
                          <WalletIcon className="w-4 h-4 text-ink" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-ink" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-sm">
                          {wallet.wallet_name}
                        </h4>
                        <p className="text-mute text-xs">
                          {isCash ? "Uang Tunai" : "Bank / E-Wallet"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(wallet.id, wallet.wallet_name)}
                      disabled={deletingId === wallet.id}
                      title="Hapus Dompet"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                    >
                      {deletingId === wallet.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="relative z-10">
                    <p
                      className={`font-extrabold text-xl ${
                        wallet.current_balance < 0 ? "text-rose-600" : "text-ink"
                      }`}
                    >
                      {formatRupiah(wallet.current_balance)}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      )}
    </PageShell>
  );
}
