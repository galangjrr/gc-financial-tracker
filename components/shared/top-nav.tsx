"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, LogOut, ChevronDown } from "lucide-react";

const TOP_NAV_LINKS = [
  { name: "Beranda", href: "/dashboard" },
  { name: "Riwayat", href: "/transactions" },
  { name: "Budget", href: "/categories" },
  { name: "Dompet", href: "/wallets" },
];

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/transactions?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full pt-safe h-[calc(60px+env(safe-area-inset-top,0px))] md:h-[64px] bg-canvas/92 backdrop-blur-xl border-b border-hairline/80 flex items-center justify-between px-4 md:px-8">
      {/* Kiri: Nav Tabs Desktop */}
      <div className="hidden lg:flex items-center gap-6">
        <nav className="flex items-center gap-2" aria-label="Navigasi Header Desktop">
          {TOP_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold px-3.5 py-2 rounded-full transition-all ${
                  isActive 
                    ? "bg-secondary-bg text-ink font-bold shadow-xs" 
                    : "text-mute hover:text-ink hover:bg-surface-card"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tengah: Search Box Pill */}
      <div className="flex-1 max-w-md mx-2 md:mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <label htmlFor="top-nav-search" className="sr-only">
            Cari catatan transaksi
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
          <input
            id="top-nav-search"
            type="search"
            placeholder="Cari transaksi atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-surface-card border border-hairline rounded-full pl-10 pr-4 text-xs md:text-sm font-medium text-ink placeholder:text-ash focus:outline-none focus:border-ink focus:bg-canvas transition-colors"
          />
        </form>
      </div>

      {/* Kanan: Profil Dropdown */}
      <div className="flex items-center justify-end relative" ref={dropdownRef}>
        <button 
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-surface-card active:scale-95 transition-all min-h-[44px] min-w-[44px]"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          aria-label="Buka menu profil akun"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[13px] font-bold text-ink leading-tight">Galang</span>
            <span className="text-[10px] font-semibold text-mute uppercase tracking-wider">Admin</span>
          </div>
          <Image 
            src="https://ui-avatars.com/api/?name=Galang&background=e60023&color=fff" 
            alt="Foto Profil Galang"
            width={36}
            height={36}
            className="rounded-full border border-hairline object-cover"
            unoptimized
          />
          <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-mute transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-[52px] right-0 w-64 bg-canvas border border-hairline rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <Link 
              href="/settings" 
              onClick={() => setIsDropdownOpen(false)} 
              className="flex items-center gap-3 p-3 hover:bg-surface-card rounded-2xl transition-colors mb-1"
            >
              <Image 
                src="https://ui-avatars.com/api/?name=Galang&background=e60023&color=fff" 
                alt="Foto Profil Galang"
                width={40}
                height={40}
                className="rounded-full border border-hairline"
                unoptimized
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink text-sm truncate">Galang</p>
                <p className="font-medium text-mute text-xs truncate">Admin Keluarga</p>
              </div>
            </Link>
            
            <div className="w-full h-px bg-hairline my-1" />

            <div className="space-y-1">
              <Link 
                href="/settings" 
                onClick={() => setIsDropdownOpen(false)} 
                className="flex items-center gap-2.5 p-2.5 hover:bg-surface-card rounded-xl transition-colors text-ink text-xs font-semibold"
              >
                <User className="w-4 h-4 text-mute" />
                <span>Pengaturan Akun</span>
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsDropdownOpen(false)} 
                className="flex items-center gap-2.5 p-2.5 hover:bg-rose-50 rounded-xl transition-colors text-rose-700 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Keluar</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
