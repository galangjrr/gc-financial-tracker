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
} from "lucide-react";

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MENU_GRID = [
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
        <Drawer.Overlay className="fixed inset-0 bg-ink/50 z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[32px] bg-canvas outline-none max-w-lg mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.12)]">
          <div className="p-6 pb-[max(env(safe-area-inset-bottom,0px),24px)]">
            <div className="mx-auto mb-5 h-1.5 w-12 shrink-0 rounded-full bg-hairline" />
            
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-ink">Lainnya</h2>
              <button 
                onClick={() => onOpenChange(false)} 
                className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-ink hover:bg-secondary-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3-Column Grid persis seperti UI Lama */}
            <div className="grid grid-cols-3 gap-3">
              {MENU_GRID.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="flex flex-col items-center justify-center gap-2 p-3.5 bg-surface-card hover:bg-secondary-bg rounded-[20px] transition-all border border-hairline/60 hover:border-hairline"
                  >
                    <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <span className="text-[11px] font-bold text-ink text-center">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-hairline">
              <Link
                href="/login"
                onClick={() => onOpenChange(false)}
                className="w-full flex justify-center items-center gap-2 py-3 bg-rose-50 text-[#e60023] hover:bg-rose-100 font-bold rounded-[16px] text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" /> Keluar Aplikasi
              </Link>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
