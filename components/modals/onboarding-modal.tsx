"use client";
import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Users, User } from "lucide-react";

export function OnboardingModal({ open, setOpen }: { open: boolean, setOpen: (o: boolean) => void }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8 border-0 shadow-xl bg-canvas">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-semibold text-[22px] text-ink">Pilih Tipe Akun</DialogTitle>
            <DialogDescription className="text-[16px] text-mute">
              Pilih tipe akun untuk memulai perjalanan finansial Anda.
            </DialogDescription>
          </DialogHeader>
          <OnboardingSelection onSubmit={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-canvas border-hairline">
        <DrawerHeader className="text-left px-6 pt-6 pb-2">
          <DrawerTitle className="font-semibold text-[22px] text-ink">Pilih Tipe Akun</DrawerTitle>
          <DrawerDescription className="text-[16px] text-mute">
            Pilih tipe akun untuk memulai perjalanan finansial Anda.
          </DrawerDescription>
        </DrawerHeader>
        <OnboardingSelection className="px-6 pb-4" onSubmit={() => setOpen(false)} />
        <DrawerFooter className="px-6 pb-8 pt-0">
          <DrawerClose asChild>
            <Button variant="outline" className="rounded-full h-12 font-bold w-full text-ink border-hairline bg-surface-card hover:bg-secondary-bg">Nanti Saja</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function OnboardingSelection({ className, onSubmit }: { className?: string, onSubmit: () => void }) {
  return (
    <div className={`grid gap-4 ${className || ''}`}>
      <button onClick={onSubmit} className="flex items-center gap-4 p-5 rounded-[16px] border border-hairline hover:border-ink bg-surface-card transition-colors text-left group">
        <div className="w-12 h-12 rounded-full bg-secondary-bg group-hover:bg-hairline flex items-center justify-center shrink-0 transition-colors">
          <User className="w-6 h-6 text-mute group-hover:text-ink" />
        </div>
        <div>
          <h4 className="font-semibold text-ink text-[18px]">Personal Plan</h4>
          <p className="text-[14px] text-mute mt-1">Untuk penggunaan pribadi. Atur uang saku dan gaji.</p>
        </div>
      </button>

      <button onClick={onSubmit} className="flex items-center gap-4 p-5 rounded-[16px] border border-primary bg-primary/5 transition-colors text-left group relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">
          POPULER
        </div>
        <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center shrink-0 shadow-sm">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-ink text-[18px]">Family Plan</h4>
          <p className="text-[14px] text-mute mt-1">Gabung bersama anggota keluarga hingga 5 orang.</p>
        </div>
      </button>
    </div>
  );
}
