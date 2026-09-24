"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { api, ActivityLog } from "@/lib/api";
import { formatRupiah, formatRealtime } from "@/lib/utils";
import {
  Activity,
  Search,
  Smartphone,
  Send,
  PlusCircle,
  ArrowRightLeft,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Clock,
  ShieldCheck,
} from "lucide-react";

const ACTION_FILTERS = [
  { label: "Semua Aktivitas", value: "Semua" },
  { label: "Pencatatan", value: "transaction_created" },
  { label: "Transfer Saldo", value: "transfer_created" },
  { label: "Hapus Transaksi", value: "transaction_deleted" },
];

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("Semua");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLogs();

    const handleRefresh = () => {
      loadLogs();
    };
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, [selectedAction]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityLogs(selectedAction);
      setLogs(data);
    } catch (err) {
      console.error("Gagal memuat log tracker:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.title.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.actor_name.toLowerCase().includes(term) ||
      log.source_device.toLowerCase().includes(term)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "transaction_created":
        return {
          icon: PlusCircle,
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
          label: "Pencatatan Baru",
        };
      case "transfer_created":
        return {
          icon: ArrowRightLeft,
          color: "text-teal-600 bg-teal-50 border-teal-200",
          label: "Transfer Saldo",
        };
      case "transaction_deleted":
        return {
          icon: Trash2,
          color: "text-rose-600 bg-rose-50 border-rose-200",
          label: "Transaksi Dihapus",
        };
      case "wallet_created":
        return {
          icon: PlusCircle,
          color: "text-blue-600 bg-blue-50 border-blue-200",
          label: "Dompet Baru",
        };
      default:
        return {
          icon: Activity,
          color: "text-ink bg-secondary-bg border-hairline",
          label: "Aktivitas",
        };
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      return formatRealtime(isoString);
    } catch {
      return isoString;
    }
  };

  return (
    <PageShell
      title="Log Tracker"
      subtitle="Audit trail dan rekaman aktivitas keuangan real-time keluarga"
    >
      <div className="space-y-6">
        {/* Banner Real-time Guard */}
        <div className="flex items-center gap-3 p-4 bg-surface-card border border-hairline rounded-[20px]">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-ink text-sm">Pencatatan Otomatis Real-time</h4>
            <p className="text-xs text-mute mt-0.5">
              Setiap penambahan, transfer, atau penghapusan data otomatis tercatat lengkap dengan stempel waktu detik dan perangkat pengirim.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
            <input
              type="text"
              placeholder="Cari aktivitas, nama anggota, catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-canvas border border-hairline rounded-full pl-10 pr-4 text-xs md:text-sm font-medium text-ink focus:outline-none focus:border-ink transition-colors placeholder:text-ash"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ACTION_FILTERS.map((f) => {
              const active = selectedAction === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setSelectedAction(f.value)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-colors ${
                    active
                      ? "bg-ink text-canvas shadow-sm"
                      : "bg-surface-card text-mute hover:text-ink hover:bg-secondary-bg border border-hairline"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Log List */}
        {loading ? (
          <DashboardSkeleton />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Belum Ada Log Aktivitas"
            description="Aktivitas pencatatan keuangan keluargamu akan terekam otomatis di sini."
            actionLabel="Kembali ke Beranda"
            onAction={() => window.location.href = "/dashboard"}
          />
        ) : (
          <div className="bg-surface-card border border-hairline rounded-[24px] p-4 md:p-6 space-y-3">
            <div className="flex justify-between items-center px-2 pb-2 border-b border-hairline text-xs font-bold text-mute">
              <span>RIWAYAT AUDIT ({filteredLogs.length})</span>
              <span>WAKTU &amp; PERANGKAT</span>
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const badge = getActionBadge(log.action_type);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={log.id}
                    className="p-4 bg-canvas rounded-[18px] border border-hairline/80 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:border-hairline"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border ${badge.color}`}>
                        <BadgeIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-sm text-ink">{log.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary-bg text-ink flex items-center gap-1">
                            <User className="w-3 h-3 text-mute" /> {log.actor_name}
                          </span>
                        </div>
                        <p className="text-xs text-body font-medium leading-relaxed">
                          {log.details}
                        </p>
                        {log.amount > 0 && (
                          <p className="text-xs font-bold text-ink mt-1">
                            Nominal: {formatRupiah(log.amount)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center md:flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-hairline/50 text-[11px] text-mute shrink-0">
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <Clock className="w-3.5 h-3.5 text-mute" />
                        <span>{formatTimestamp(log.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 font-medium">
                        <Smartphone className="w-3 h-3 text-mute" />
                        <span>{log.source_device}</span>
                      </div>
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
