"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { MobileNav } from "@/components/shared/mobile-nav";
import { MobileMenuDrawer } from "@/components/shared/mobile-menu-drawer";
import { TopNav } from "@/components/shared/top-nav";
import { TransactionModal } from "@/components/modals/transaction-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  return (
    <div className="bg-surface-soft min-h-screen text-body font-sans flex">
      <Sidebar onOpenTransactionModal={() => setIsTxModalOpen(true)} />
      
      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen pb-16 md:pb-0">
        <TopNav />
        <main className="flex-1">
          {children}
        </main>
      </div>

      <MobileNav 
        onOpenMenu={() => setIsMenuOpen(true)} 
        onOpenTransactionModal={() => setIsTxModalOpen(true)}
      />
      
      {/* Global Modals & Drawers */}
      <MobileMenuDrawer open={isMenuOpen} onOpenChange={setIsMenuOpen} />
      <TransactionModal open={isTxModalOpen} setOpen={setIsTxModalOpen} />
    </div>
  );
}
