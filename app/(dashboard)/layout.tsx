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

  React.useEffect(() => {
    const handleOpenModal = () => setIsTxModalOpen(true);
    window.addEventListener("open-tx-modal", handleOpenModal);
    return () => window.removeEventListener("open-tx-modal", handleOpenModal);
  }, []);

  return (
    <div className="bg-surface-soft min-h-[100dvh] text-body font-sans flex">
      <Sidebar onOpenTransactionModal={() => setIsTxModalOpen(true)} />
      
      <div className="flex-1 md:pl-[250px] flex flex-col min-h-[100dvh] pb-[calc(76px+env(safe-area-inset-bottom,0px))] md:pb-0">
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
