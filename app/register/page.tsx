"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Semua kolom formulir wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter demi keamanan akun keluarga.");
      return;
    }

    try {
      setIsLoading(true);
      localStorage.setItem("gc_auth_name", name.trim());
      localStorage.setItem("gc_auth_email", email.trim());
      router.push("/dashboard");
    } catch {
      setErrorMessage("Terjadi kendala saat pendaftaran akun. Coba lagi.");
    } finally {
      setIsLoading(false);
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
            Buat Akun Baru
          </h1>
          <p className="text-xs sm:text-sm text-mute font-medium">
            Mulai atur keuangan keluarga tanpa ribet
          </p>
        </header>

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
              htmlFor="name"
              className="block text-xs sm:text-[13px] font-semibold text-ink mb-1.5"
            >
              Nama Lengkap
            </label>
            <input 
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi" 
              required
              className="w-full h-12 bg-surface-card border border-hairline rounded-2xl px-4 text-sm font-medium text-ink placeholder:text-ash focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 focus:bg-canvas transition-all"
            />
          </div>

          <div>
            <label 
              htmlFor="email"
              className="block text-xs sm:text-[13px] font-semibold text-ink mb-1.5"
            >
              Email
            </label>
            <input 
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com" 
              required
              className="w-full h-12 bg-surface-card border border-hairline rounded-2xl px-4 text-sm font-medium text-ink placeholder:text-ash focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 focus:bg-canvas transition-all"
            />
          </div>

          <div>
            <label 
              htmlFor="password"
              className="block text-xs sm:text-[13px] font-semibold text-ink mb-1.5"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter" 
                required
                className="w-full h-12 bg-surface-card border border-hairline rounded-2xl pl-4 pr-12 text-sm font-medium text-ink placeholder:text-ash focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 focus:bg-canvas transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-mute hover:text-ink transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-ink"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
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
            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-full text-sm hover:bg-primary-pressed active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <span className="text-xs font-medium">Memproses...</span>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-canvas px-3 text-mute font-medium">
              Atau daftar dengan
            </span>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => {
            localStorage.setItem("gc_auth_email", "keluarga@gcfinance.app");
            router.push("/dashboard");
          }}
          className="w-full h-12 bg-surface-card border border-hairline text-ink font-bold rounded-full text-sm flex items-center justify-center gap-3 hover:bg-secondary-bg active:scale-[0.98] transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Daftar dengan Google
        </button>

        <p className="text-center text-xs text-mute mt-6 font-medium">
          Sudah punya akun?{" "}
          <Link 
            href="/login" 
            className="text-ink font-bold hover:text-primary transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
