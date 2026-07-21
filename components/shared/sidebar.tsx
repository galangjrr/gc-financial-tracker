import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, FileText, Target, Handshake, Users, Settings, Plus, ReceiptText, PieChart, Wallet } from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { name: "Riwayat", href: "/transactions", icon: ReceiptText },
  { name: "Dompet", href: "/wallets", icon: Wallet },
  { name: "Budget", href: "/categories", icon: PieChart },
  { name: "Pantau Duit", href: "/analytics", icon: LineChart },
  { name: "Catat Utang", href: "/debts", icon: Handshake },
  { name: "Nabung", href: "/goals", icon: Target },
  { name: "Laporan", href: "/reports", icon: FileText },
  { name: "Keluarga", href: "/family", icon: Users },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar({ onOpenTransactionModal }: { onOpenTransactionModal?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 bg-canvas border-r border-hairline z-40">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-[140px] h-[32px]">
            <Image
              src="/assets/logo/logo-wordmark.png"
              alt="GC Financial Tracker"
              fill
              className="object-contain object-left"
            />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-colors ${isActive
                ? "bg-primary text-primary-foreground font-bold"
                : "text-mute hover:bg-surface-card hover:text-ink font-semibold"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[16px]">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 pb-2">
          <button
            onClick={onOpenTransactionModal}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-md bg-primary text-[14px] font-bold text-primary-foreground hover:bg-primary-pressed transition-colors"
          >
            <Plus className="w-5 h-5" />
            Transaksi Baru
          </button>
        </div>
    </aside>
  );
}
