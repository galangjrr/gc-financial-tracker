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
        <div className="space-y-6 w-full max-w-full min-w-0">
          {/* Header Card Saldo Aktif */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border border-hairline rounded-3xl p-5 sm:p-6 w-full max-w-full min-w-0 overflow-hidden">
            <div className="min-w-0">
              <p className="text-mute text-xs font-bold uppercase tracking-wider mb-1.5 truncate">
                TOTAL SALDO AKTIF
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink leading-none tabular-nums tracking-tight truncate">
                {formatRupiah(totalBalance)}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5 self-stretch sm:self-start md:self-auto">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-tx-modal"))}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-full bg-secondary-bg hover:bg-hairline text-ink font-bold flex items-center justify-center gap-2 text-xs transition-all active:scale-95 shrink-0 focus-visible:ring-2 focus-visible:ring-ink"
              >
                <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
                <span>Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-initial h-11 px-5 rounded-full bg-primary hover:bg-primary-pressed text-primary-foreground font-bold flex items-center justify-center gap-2 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.22)] transition-all active:scale-95 shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambah Rekening</span>
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
                  className="bg-surface-card border border-hairline rounded-2xl p-5 flex flex-col justify-between h-36 hover:border-ink/20 transition-all relative overflow-hidden group min-w-0"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-canvas flex items-center justify-center border border-hairline shrink-0">
                        {isCash ? (
                          <WalletIcon className="w-4 h-4 text-ink" aria-hidden="true" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-ink" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-ink text-sm truncate">
                          {wallet.wallet_name}
                        </h4>
                        <p className="text-mute text-xs font-medium truncate">
                          {isCash ? "Uang Tunai" : "Bank atau Dompet Digital"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(wallet.id, wallet.wallet_name)}
                      disabled={deletingId === wallet.id}
                      aria-label={`Hapus dompet ${wallet.wallet_name}`}
                      className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-mute hover:text-rose-600 hover:bg-rose-50 rounded-full active:scale-90 transition-all shrink-0 ml-2"
                    >
                      {deletingId === wallet.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" aria-hidden="true" />
                      ) : (
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="relative z-10">
                    <p
                      className={`font-extrabold text-xl tabular-nums tracking-tight truncate ${
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
