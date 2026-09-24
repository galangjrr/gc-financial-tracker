"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, PieChart, Menu, Plus } from "lucide-react";

interface MobileNavProps {
  onOpenMenu: () => void;
  onOpenTransactionModal: () => void;
}

const NAV_ITEMS_LEFT = [
  { name: "Beranda", href: "/dashboard", icon: Home },
  { name: "Riwayat", href: "/transactions", icon: ReceiptText },
];

const NAV_ITEMS_RIGHT = [
  { name: "Budget", href: "/categories", icon: PieChart },
];

export function MobileNav({ onOpenMenu, onOpenTransactionModal }: MobileNavProps) {
  const pathname = usePathname();

  const renderLink = (item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all active:scale-95 ${
          isActive
            ? "text-primary font-bold"
            : "text-mute font-medium hover:text-ink active:bg-surface-card"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="relative flex items-center justify-center w-6 h-6 mb-1">
          <Icon className="w-5 h-5 transition-transform" />
          {isActive && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>
        <span className="text-[11px] leading-none tracking-tight">{item.name}</span>
      </Link>
    );
  };

  return (
    <nav 
      aria-label="Navigasi Utama Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas/92 backdrop-blur-xl border-t border-hairline/80 z-40 pb-[max(env(safe-area-inset-bottom,0px),10px)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between px-3 pt-1.5 relative max-w-lg mx-auto">
        {/* Sisi Kiri */}
        <div className="flex flex-1 justify-around items-center">
          {NAV_ITEMS_LEFT.map(renderLink)}
        </div>

        {/* Tombol Utama Tambah Transaksi di Tengah */}
        <div className="flex justify-center shrink-0 mx-2 relative -top-4">
          <button 
            type="button"
            onClick={onOpenTransactionModal}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_6px_20px_rgba(230,0,35,0.38)] hover:bg-primary-pressed active:scale-90 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
            aria-label="Catat Transaksi Baru Cepat"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Sisi Kanan */}
        <div className="flex flex-1 justify-around items-center">
          {NAV_ITEMS_RIGHT.map(renderLink)}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all active:scale-95 text-mute font-medium hover:text-ink active:bg-surface-card"
            aria-label="Buka Menu Navigasi Lengkap"
          >
            <div className="flex items-center justify-center w-6 h-6 mb-1">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-none tracking-tight">Menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
