"use client";

import React from "react";
import { Drawer } from "vaul";
import Link from "next/link";
import {
  Wallet,
  LineChart,
  FileText,
  Target,
  Handshake,
  Users,
  Settings,
  X,
  LogOut,
  Activity,
} from "lucide-react";

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MENU_GRID = [
  { name: "Log Tracker", href: "/logs", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Dompet", href: "/wallets", icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Pantau Duit", href: "/analytics", icon: LineChart, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Laporan", href: "/reports", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
  { name: "Nabung", href: "/goals", icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Catat Utang", href: "/debts", icon: Handshake, color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Keluarga", href: "/family", icon: Users, color: "text-sky-500", bg: "bg-sky-50" },
  { name: "Pengaturan", href: "/settings", icon: Settings, color: "text-slate-600", bg: "bg-slate-100" },
];

export function MobileMenuDrawer({ open, onOpenChange }: MobileMenuDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 z-50 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-canvas outline-none max-w-lg mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.12)]">
          <div className="p-5 sm:p-6 pb-[max(env(safe-area-inset-bottom,0px),24px)]">
            <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-hairline" />
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">Menu Navigasi</h2>
              <button 
                type="button"
                onClick={() => onOpenChange(false)} 
                aria-label="Tutup menu navigasi"
                className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-ink hover:bg-secondary-bg transition-colors active:scale-95"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {MENU_GRID.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 bg-surface-card hover:bg-secondary-bg rounded-2xl transition-all border border-hairline/60 hover:border-hairline active:scale-95"
                  >
                    <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-bold text-ink text-center truncate w-full">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-hairline">
              <Link
                href="/login"
                onClick={() => onOpenChange(false)}
                className="w-full flex justify-center items-center gap-2 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-2xl text-xs transition-colors active:scale-95"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Keluar dari Akun</span>
              </Link>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
