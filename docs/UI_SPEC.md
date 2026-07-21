# UI_SPEC.md — Design System & Interface Specifications
> System: **GC Financial Tracker**  
> UI Framework: **Tailwind CSS v3 + shadcn/ui (Radix UI)**  
> Design Language: **Mobile-First, Professional Clean Financial SaaS**

---

## 1.0 Progressive Web App (PWA) & Multi-Device Compatibility
* **Fully Progressive:** Aplikasi harus dapat diinstal sebagai PWA di perangkat Android, iOS, dan Desktop dengan manifest yang valid serta dukungan offline caching dasar.
* **Multi-Device Responsive Grid:** Layout wajib mendukung fluid layout breakpoints untuk transisi sempurna antara layar Desktop (1280px+), Tablet (768px - 1024px), dan Mobile (320px - 480px).
* **Responsive Dialogs:** Semua modal form input wajib dimuat sebagai Dialog melayang di layar Desktop/Tablet (sm:max-w-[425px]), dan secara otomatis ter-render sebagai Bottom Sheet (Drawer) pada resolusi Mobile.

---

## 1. Design System Tokens & Color Palette

### 1.1 Color Tokens

```javascript
// tailwind.config.js theme extension preview
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          700: '#15803D', // Primary Forest Emerald Accent
          900: '#14532D',
        },
        financial: {
          expense: '#E11D48', // Muted Rose Red
          income: '#10B981',  // Vivid Emerald Green
          savings: '#0284C7', // Deep Sky Blue
          bill: '#D97706',    // Amber Warning
        },
        surface: {
          light: '#F8FAFC',   // Clean Off-White Background
          card: '#FFFFFF',    // Crisp Card Surface
          dark: '#0F172A',    // Deep Slate Dark Mode Surface
        }
      }
    }
  }
}
```

---

## 2. Page & Route Specs

### 2.1 Route Map

| `/` | No | Public | Landing Page with Hero, Features, Pricing & Google Login CTA |
| `/login` | No | Public | Single Sign-On (SSO) via Google OAuth |
| `/register` | No | Public | Registrasi via Google OAuth & form "Personal" / "Keluarga" |
| `/dashboard` | Yes | Viewer+ | Main Dashboard (Net worth, wallet carousel, budget bars) |
| `/wallets` | Yes | Viewer+ | Detailed wallet overview, account balances, transfers |
| `/categories` | Yes | Viewer+ | Category budgeting targets & keyword configuration |
| `/transactions` | Yes | Viewer+ | Infinite scroll transaction audit log with filter bar |
| `/settings/family` | Yes | Admin | Member invitation links, role updates, Telegram binding |
| `/settings/billing` | Yes | Admin | Subscription package selection, Midtrans Snap trigger |

---

### 2.2 Wireframe Blueprint & Component Specifications

#### Landing Page (`app/page.tsx`)

```text
+-------------------------------------------------------------------------+
| [Logo] GC Financial Tracker                         [ Masuk via Google ] |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ HERO SECTION ]                                                       |
|  Atur Keuangan Keluarga & Personal Tanpa Ribet                          |
|  Satu aplikasi, sinkronisasi instan, pencatatan otomatis via Telegram.   |
|                                                                         |
|                        [ Mulai Sekarang - Free Trial ]                  |
|                                                                         |
|  [ SCREENSHOT PREVIEW / CAROUSEL ]                                      |
|  +-------------------------------------------------------------------+  |
|  | [ Gambar Mockup Dashboard / OCR Telegram ]                        |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  [ PRICING PACKAGES ]                                                   |
|  +-------------------+  +-------------------+  +-------------------+    |
|  | Personal Plan     |  | Family Plan       |  | Lifetime Deal     |    |
|  | Rp 15.000 / bln   |  | Rp 29.000 / bln   |  | Rp 199.000 Sekali |    |
|  +-------------------+  +-------------------+  +-------------------+    |
|                                                                         |
+-------------------------------------------------------------------------+
```

#### Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)

```text
+-------------------------------------------------------------------------+
| [Header] GC Financial Tracker      [Family Switcher]  [Profile Avatar] |
+-------------------------------------------------------------------------+
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | TOTAL KEKAYAAN KELUARGA (FAMILY NET WORTH)                        |  |
|  | Rp 48.250.000                                                     |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  [ Carousel Dompet / Wallets ]                                          |
|  +-------------------+  +-------------------+  +-------------------+    |
|  | BCA Rekening Utama|  | Mandiri Tabungan  |  | Cash Dompet       |    |
|  | Rp 32.100.000     |  | Rp 15.000.000     |  | Rp 1.150.000      |    |
|  +-------------------+  +-------------------+  +-------------------+    |
|                                                                         |
|  +-----------------------------------+ +-------------------------------+|
|  | BUDGET BANTUAN BULAN INI          | | TRANSAKSI TERAKHIR          ||
|  | Pengeluaran: 68% [======---]     | | • Makan Siang Rp 45.000     ||
|  | Tagihan:     90% [=========-]     | | • Gaji Masuk  Rp 12.000.000 ||
|  +-----------------------------------+ +-------------------------------+|
|                                                                         |
| [ Floating Action Button: + Tambah Transaksi ]                          |
+-------------------------------------------------------------------------+
```

---

### 2.3 Component Implementation Standard: Transaction Modal (`components/forms/transaction-modal.tsx`)

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const transactionSchema = z.object({
  type: z.enum(["Pengeluaran", "Pemasukan", "Tabungan", "Tagihan", "Liabilitas"]),
  amount: z.number().min(1, "Nominal harus lebih dari 0"),
  wallet_source_id: z.string().uuid("Pilih dompet asal"),
  category_id: z.string().uuid("Pilih kategori"),
  tx_date: z.string(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "Pengeluaran",
      tx_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: TransactionFormValues) => {
    setLoading(true);
    try {
      // Execute Server Action / Supabase Mutation
      console.log("Submitting transaction:", data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-surface-card rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nominal (Rp)</label>
            <Input
              type="number"
              placeholder="0"
              {...form.register("amount", { valueAsNumber: true })}
              className="text-lg font-bold text-brand-700"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-financial-expense mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-brand-700 hover:bg-brand-900 text-white font-semibold">
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```
