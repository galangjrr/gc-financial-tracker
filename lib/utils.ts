import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat("id-ID").format(abs);
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function getLocalISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatRealtime(dateOrIso: string | Date): string {
  if (!dateOrIso) return "";
  const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return String(dateOrIso);

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec >= 0 && diffSec < 60) {
    return "Baru saja";
  }
  if (diffSec >= 60 && diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins} menit lalu`;
  }

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":");

  if (isToday) {
    return `Hari ini, ${timeStr} WIB`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Kemarin, ${timeStr} WIB`;
  }

  const dateStr = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  return `${dateStr}, ${timeStr} WIB`;
}
