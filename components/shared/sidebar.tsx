"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  FileText,
  Target,
  Handshake,
  Users,
  Settings,
  Plus,
  ReceiptText,
  PieChart,
  Wallet,
  Activity,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { name: "Log Tracker", href: "/logs", icon: Activity },
  { name: "Pantau Duit", href: "/analytics", icon: LineChart },
  { name: "Laporan", href: "/reports", icon: FileText },
  { name: "Nabung", href: "/goals", icon: Target },
  { name: "Catat Utang", href: "/debts", icon: Handshake },
  { name: "Dompet", href: "/wallets", icon: Wallet },
  { name: "Budget", href: "/categories", icon: PieChart },
  { name: "Riwayat", href: "/transactions", icon: ReceiptText },
  { name: "Keluarga", href: "/family", icon: Users },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar({ onOpenTransactionModal }: { onOpenTransactionModal?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[250px] fixed inset-y-0 left-0 bg-canvas border-r border-hairline z-40">
      <div className="p-6 pb-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-[140px] h-[36px]">
            <Image
              src="/assets/logo/logo-wordmark.png"
              alt="GC Financial Tracker"
              fill
              className="object-contain object-left"
            />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] transition-colors text-sm ${
                isActive
                  ? "bg-surface-card text-ink font-bold"
                  : "text-mute hover:bg-surface-card hover:text-ink font-medium"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 px-1">
          <button
            onClick={onOpenTransactionModal}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-[14px] bg-[#e60023] hover:bg-[#cc001f] text-xs font-bold text-white transition-all shadow-[0_4px_12px_rgba(230,0,35,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Transaksi Baru
          </button>
        </div>
      </nav>

      {/* Footer Sidebar */}
      <div className="p-3 border-t border-hairline space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3.5 py-2 rounded-[12px] text-mute hover:text-ink hover:bg-surface-card text-xs font-medium transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Bantuan</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2 rounded-[12px] text-mute hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </Link>
      </div>
    </aside>
  );
}
