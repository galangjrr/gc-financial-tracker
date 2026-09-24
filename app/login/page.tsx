"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, UserCheck, Shield } from "lucide-react";
import { api } from "@/lib/api";

const QUICK_MEMBERS = [
  { name: "Galang", role: "Admin" },
  { name: "Mama", role: "Editor" },
  { name: "Citra", role: "Editor" },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefetch dashboard di background saat halaman login terbuka agar navigasi instan
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/transactions");
    router.prefetch("/wallets");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanId = identifier.trim();
    const cleanPin = pin.trim();

    if (!cleanId || !cleanPin) {
      setErrorMessage("Silakan isi nama atau email dan PIN terlebih dahulu");
      return;
    }

    try {
      setIsLoading(true);
      const member = await api.login(cleanId, cleanPin);
      
      // Simpan sesi lokal
      if (typeof window !== "undefined") {
        localStorage.setItem("gc_auth_user", JSON.stringify(member));
        localStorage.setItem("gc_auth_email", member.display_name);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Nama atau PIN salah, silakan cek kembali");
      setIsLoading(false);
    }
  };

  const handleSelectQuickMember = (memberName: string) => {
    setIdentifier(memberName);
    setErrorMessage("");
    const pinInput = document.getElementById("pin-input");
    if (pinInput) {
      pinInput.focus();
    }
  };

  return (
    <main className="min-h-dvh bg-surface-soft flex flex-col justify-center items-center px-4 py-8 pt-safe pb-safe">
      <div className="w-full max-w-[420px] bg-canvas rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-hairline transition-all">
        {/* Logo Brand */}
        <div className="flex justify-center mb-6">
          <Link 
            href="/" 
            className="flex items-center justify-center p-1 rounded-full hover:opacity-90 transition-opacity"
            aria-label="Kembali ke Beranda Utama"
          >
            <Image 
              src="/assets/logo/logo-icon.png" 
              alt="GC Finance Logo" 
              width={52} 
              height={52} 
              className="rounded-full shadow-sm"
              priority
            />
          </Link>
        </div>

        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-[26px] font-bold text-ink tracking-tight mb-1.5">
            Masuk ke Akun
          </h1>
          <p className="text-xs sm:text-sm text-mute font-medium">
            Pencatatan keuangan keluarga terpusat
          </p>
        </header>

        {/* Akses Cepat Anggota Keluarga */}
        <div className="mb-5">
          <p className="text-[11px] font-bold text-mute uppercase tracking-wider mb-2">
            Pilih Profil Cepat
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_MEMBERS.map((m) => {
              const isSelected = identifier.toLowerCase() === m.name.toLowerCase();
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handleSelectQuickMember(m.name)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[56px] active:scale-95 ${
                    isSelected
                      ? "bg-secondary-bg border-ink text-ink font-bold shadow-xs"
                      : "bg-surface-card border-hairline text-body hover:border-ink/20"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-xs font-bold text-ink leading-tight">{m.name}</span>
                  <span className="text-[10px] text-mute font-medium leading-none mt-0.5">{m.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div 
            role="alert"
            aria-live="polite"
            className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-[13px] font-medium leading-relaxed animate-in fade-in duration-150"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label 
              htmlFor="identifier"
              className="block text-xs sm:text-[13px] font-semibold text-ink mb-1.5"
            >
              Nama atau Email
            </label>
            <input 
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Contoh: Galang atau email" 
              required
              className="w-full h-12 bg-surface-card border border-hairline rounded-2xl px-4 text-sm font-medium text-ink placeholder:text-ash focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 focus:bg-canvas transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="pin-input"
                className="block text-xs sm:text-[13px] font-semibold text-ink"
              >
                PIN Keamanan
              </label>
              <span className="text-[11px] font-medium text-mute">
                6 digit angka
              </span>
            </div>
            <div className="relative">
              <input 
                id="pin-input"
                name="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••" 
                required
                className="w-full h-12 bg-surface-card border border-hairline rounded-2xl pl-4 pr-12 text-sm font-medium tracking-widest text-ink placeholder:text-ash focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 focus:bg-canvas transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-mute hover:text-ink transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-ink"
                aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-ink text-canvas font-bold rounded-full text-sm hover:bg-ink-soft active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-3 shadow-sm focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <span className="text-xs font-medium">Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-mute mt-6 font-medium">
          Perlu bantuan akun?{" "}
          <Link 
            href="/register" 
            className="text-primary font-bold hover:underline transition-colors"
          >
            Hubungi Admin
          </Link>
        </p>
      </div>
    </main>
  );
}
