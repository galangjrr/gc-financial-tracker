"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Receipt,
  CreditCard,
} from "lucide-react";

const TX_TYPES = [
  { value: "Pengeluaran", label: "Pengeluaran", icon: TrendingDown, bgClass: "bg-financial-expense" },
  { value: "Pemasukan", label: "Pemasukan", icon: TrendingUp, bgClass: "bg-financial-income" },
  { value: "Tabungan", label: "Tabungan", icon: PiggyBank, bgClass: "bg-financial-savings" },
  { value: "Tagihan", label: "Tagihan", icon: Receipt, bgClass: "bg-financial-bill" },
  { value: "Liabilitas", label: "Liabilitas", icon: CreditCard, bgClass: "bg-financial-expense" },
] as const;

const transactionSchema = z.object({
  type: z.enum(["Pengeluaran", "Pemasukan", "Tabungan", "Tagihan", "Liabilitas"]),
  amount: z.number().min(1, "Nominal harus lebih dari 0"),
  category: z.string().min(1, "Pilih kategori"),
  tx_date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TransactionModal({ open, setOpen }: TransactionModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-[32px] p-8 border-0 bg-canvas">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-semibold text-[22px] text-ink">
              Tambah Transaksi
            </DialogTitle>
            <DialogDescription className="text-[16px] text-mute">
              Masukkan nominal dan detail transaksi kamu.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-canvas border-hairline">
        <DrawerHeader className="text-left px-6 pt-6 pb-2">
          <DrawerTitle className="font-semibold text-[22px] text-ink">
            Tambah Transaksi
          </DrawerTitle>
          <DrawerDescription className="text-[16px] text-mute">
            Masukkan nominal dan detail transaksi kamu.
          </DrawerDescription>
        </DrawerHeader>
        <TransactionForm className="px-6 pb-4" onSuccess={() => setOpen(false)} />
        <DrawerFooter className="px-6 pb-8 pt-0">
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="rounded-full h-12 font-bold w-full text-ink border-hairline bg-surface-card hover:bg-secondary-bg"
            >
              Batal
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function TransactionForm({
  className,
  onSuccess,
}: {
  className?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "Pengeluaran",
      tx_date: new Date().toISOString().split("T")[0],
      notes: "",
      category: "",
    },
  });

  const selectedType = form.watch("type");

  const onSubmit = async (data: TransactionFormValues) => {
    setLoading(true);
    try {
      // TODO: Supabase insert
      console.log("Submitting:", data);
      form.reset();
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`grid items-start gap-5 ${className || ""}`}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* Transaction Type Chips */}
      <div className="flex flex-wrap gap-2">
        {TX_TYPES.map((t) => {
          const Icon = t.icon;
          const active = selectedType === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => form.setValue("type", t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${
                active
                  ? `${t.bgClass} text-canvas`
                  : "bg-surface-card text-ink hover:bg-secondary-bg"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Amount */}
      <div className="grid gap-2">
        <Label htmlFor="tx-amount" className="font-semibold text-ink text-[16px]">
          Nominal Rupiah
        </Label>
        <Input
          type="number"
          id="tx-amount"
          placeholder="0"
          {...form.register("amount", { valueAsNumber: true })}
          className="h-16 text-2xl font-bold rounded-[16px] px-4 bg-surface-soft border border-hairline focus-visible:ring-primary focus-visible:border-primary"
        />
        {form.formState.errors.amount && (
          <p className="text-xs text-error">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="tx-category" className="font-semibold text-ink text-[16px]">
          Kategori
        </Label>
        <Input
          id="tx-category"
          placeholder="Makanan, Transportasi, dll"
          {...form.register("category")}
          className="h-12 rounded-[16px] px-4 bg-surface-soft border border-hairline focus-visible:ring-primary focus-visible:border-primary"
        />
        {form.formState.errors.category && (
          <p className="text-xs text-error">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="grid gap-2">
        <Label htmlFor="tx-date" className="font-semibold text-ink text-[16px]">
          Tanggal
        </Label>
        <Input
          type="date"
          id="tx-date"
          {...form.register("tx_date")}
          className="h-12 rounded-[16px] px-4 bg-surface-soft border border-hairline focus-visible:ring-primary focus-visible:border-primary"
        />
      </div>

      {/* Notes */}
      <div className="grid gap-2">
        <Label htmlFor="tx-notes" className="font-semibold text-ink text-[16px]">
          Catatan (Opsional)
        </Label>
        <Input
          id="tx-notes"
          placeholder="Makan siang bareng temen"
          {...form.register("notes")}
          className="h-12 rounded-[16px] px-4 bg-surface-soft border border-hairline focus-visible:ring-primary focus-visible:border-primary"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="h-12 mt-1 rounded-[16px] bg-primary hover:bg-primary-pressed font-bold text-primary-foreground text-[16px] w-full transition-colors"
      >
        {loading ? "Menyimpan..." : "Simpan Transaksi"}
      </Button>
    </form>
  );
}
