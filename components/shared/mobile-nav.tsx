"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, PieChart, Menu } from "lucide-react";

interface MobileNavProps {
  onOpenMenu: () => void;
  onOpenTransactionModal: () => void;
}

const NAV_ITEMS = [
  { name: "Beranda", href: "/dashboard", icon: Home },
  { name: "Riwayat", href: "/transactions", icon: ReceiptText },
];

const NAV_ITEMS_RIGHT = [
  { name: "Budget", href: "/categories", icon: PieChart },
];

export function MobileNav({ onOpenMenu, onOpenTransactionModal }: MobileNavProps) {
  const pathname = usePathname();

  const renderLink = (item: any) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-col items-center justify-center p-2 min-w-[64px] rounded-[16px] transition-colors ${
          isActive
            ? "text-primary font-bold"
            : "text-mute font-medium hover:text-ink hover:bg-surface-card"
        }`}
      >
        <Icon className="w-6 h-6 mb-1" />
        <span className="text-[10px]">{item.name}</span>
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas border-t border-hairline z-40 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between px-4 py-2 relative">
        {/* Left Items */}
        <div className="flex flex-1 justify-around">
          {NAV_ITEMS.map(renderLink)}
        </div>

        {/* Center FAB */}
        <div className="flex justify-center mx-2 shrink-0 relative -top-6">
          <button 
            onClick={onOpenTransactionModal}
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(230,0,35,0.4)] hover:scale-105 transition-transform active:scale-95 bg-transparent overflow-hidden p-0"
          >
            <img 
              src="/assets/images/plus-button.png" 
              alt="Tambah" 
              className="w-full h-full object-cover scale-[1.25]"
            />
          </button>
        </div>

        {/* Right Items */}
        <div className="flex flex-1 justify-around">
          {NAV_ITEMS_RIGHT.map(renderLink)}
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center p-2 min-w-[64px] rounded-[16px] transition-colors text-mute font-medium hover:text-ink hover:bg-surface-card"
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
