"use client";

import React from "react";
import { Drawer } from "vaul";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, FileText, Target, Handshake, Users, Settings, X, Wallet } from "lucide-react";

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MENU_ITEMS = [
  { name: "Pantau Duit", href: "/analytics", icon: LineChart },
  { name: "Laporan", href: "/reports", icon: FileText },
  { name: "Nabung", href: "/goals", icon: Target },
  { name: "Catat Utang", href: "/debts", icon: Handshake },
  { name: "Keluarga", href: "/family", icon: Users },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function MobileMenuDrawer({ open, onOpenChange }: MobileMenuDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/50 z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-[32px] bg-canvas outline-none">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto mb-8 h-1.5 w-12 shrink-0 rounded-full bg-hairline" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[22px] font-bold text-ink">Menu Lainnya</h2>
              <button onClick={() => onOpenChange(false)} className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mt-4">
            <Link 
              href="/wallets" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/wallets" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <Wallet className="w-5 h-5" /> Dompet & Rekening
            </Link>
            <Link 
              href="/analytics" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/analytics" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <LineChart className="w-5 h-5" /> Pantau Duit
            </Link>
            <Link 
              href="/debts" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/debts" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <Handshake className="w-5 h-5" /> Catat Utang
            </Link>
            <Link 
              href="/goals" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/goals" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <Target className="w-5 h-5" /> Nabung
            </Link>
            <Link 
              href="/reports" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/reports" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <FileText className="w-5 h-5" /> Laporan
            </Link>
            <Link 
              href="/family" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/family" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <Users className="w-5 h-5" /> Keluarga
            </Link>
            <Link 
              href="/settings" 
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-[16px] transition-colors ${
                pathname === "/settings" ? "bg-primary text-primary-foreground font-bold" : "text-ink hover:bg-surface-soft font-semibold"
              }`}
            >
              <Settings className="w-5 h-5" /> Pengaturan
            </Link>
          </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
