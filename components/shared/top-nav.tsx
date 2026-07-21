"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function TopNav() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simulasi API call ketika debouncedSearch berubah
  useEffect(() => {
    if (debouncedSearch) {
      console.log(`[Debounced Search] Mencari: ${debouncedSearch}`);
    }
  }, [debouncedSearch]);

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-canvas/80 backdrop-blur-md border-b border-hairline flex items-center justify-between px-6 md:px-8">
      {/* Kiri: Kosong (diisi Hamburger menu di mobile) */}
      <div className="w-10 md:w-1/4"></div>

      {/* Tengah: Search Box */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" />
          <input
            type="text"
            placeholder="Cari transaksi, kategori, dll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-surface-card border border-hairline rounded-full pl-12 pr-4 text-[15px] font-semibold text-ink placeholder:text-mute focus:outline-none focus:border-ink focus:bg-canvas transition-colors"
          />
        </div>
      </div>

      {/* Kanan: Profil Google Dropdown */}
      <div className="flex items-center justify-end w-auto md:w-1/4" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-1.5 rounded-full hover:bg-surface-soft transition-colors"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[14px] font-bold text-ink leading-tight">Galang</span>
            <span className="text-[12px] font-semibold text-mute">Admin</span>
          </div>
          <Image 
            src="https://api.dicebear.com/7.x/avataaars/png?seed=Galang" 
            alt="Google Profile"
            width={40}
            height={40}
            className="rounded-full bg-secondary-bg border border-hairline object-cover"
            unoptimized
          />
          <ChevronDown className={`hidden md:block w-4 h-4 text-mute transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu FB Style */}
        {isDropdownOpen && (
          <div className="absolute top-[72px] right-6 w-72 bg-canvas border border-hairline rounded-[24px] shadow-[0_12px_48px_rgba(0,0,0,0.12)] p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header Profil Singkat */}
            <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 p-4 hover:bg-surface-soft rounded-[16px] transition-colors mb-2">
              <Image 
                src="https://api.dicebear.com/7.x/avataaars/png?seed=Galang" 
                alt="Google Profile"
                width={48}
                height={48}
                className="rounded-full bg-secondary-bg border border-hairline"
                unoptimized
              />
              <div>
                <p className="font-bold text-ink text-[16px]">Galang</p>
                <p className="font-medium text-mute text-[14px]">Lihat profil Anda</p>
              </div>
            </Link>
            
            <div className="w-full h-px bg-hairline my-2" />

            <div className="space-y-1">
              <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 p-3 hover:bg-surface-soft rounded-[16px] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center group-hover:bg-canvas transition-colors border border-transparent group-hover:border-hairline">
                  <User className="w-5 h-5 text-ink" />
                </div>
                <span className="font-bold text-ink text-[15px]">Pengaturan Akun</span>
              </Link>
              <Link href="/family" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 p-3 hover:bg-surface-soft rounded-[16px] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-secondary-bg flex items-center justify-center group-hover:bg-canvas transition-colors border border-transparent group-hover:border-hairline">
                  <Settings className="w-5 h-5 text-ink" />
                </div>
                <span className="font-bold text-ink text-[15px]">Kelola Keluarga</span>
              </Link>
            </div>

            <div className="w-full h-px bg-hairline my-2" />
            
            <Link href="/login" className="flex items-center gap-3 p-3 hover:bg-error/10 rounded-[16px] transition-colors group">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-error" />
              </div>
              <span className="font-bold text-error text-[15px]">Keluar</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
