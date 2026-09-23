"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, User, LogOut, ChevronDown } from "lucide-react";

const TOP_NAV_LINKS = [
  { name: "Beranda", href: "/dashboard" },
  { name: "Riwayat", href: "/transactions" },
  { name: "Budget", href: "/categories" },
  { name: "Dompet", href: "/wallets" },
];

export function TopNav() {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full h-[64px] bg-canvas/90 backdrop-blur-md border-b border-hairline flex items-center justify-between px-4 md:px-8">
      {/* Kiri: Nav Tabs Desktop */}
      <div className="hidden lg:flex items-center gap-6">
        <nav className="flex items-center gap-5">
          {TOP_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-semibold transition-colors ${
                  isActive ? "text-ink font-bold" : "text-mute hover:text-ink"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tengah: Search Box Pill */}
      <div className="flex-1 max-w-md mx-2 md:mx-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-surface-card border border-hairline rounded-full pl-10 pr-4 text-xs md:text-sm font-medium text-ink placeholder:text-mute focus:outline-none focus:border-ink focus:bg-canvas transition-colors"
          />
        </div>
      </div>

      {/* Kanan: Profil Dropdown */}
      <div className="flex items-center justify-end relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-surface-card transition-colors"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[13px] font-bold text-ink leading-tight">Galang</span>
            <span className="text-[10px] font-semibold text-mute uppercase tracking-wider">Admin</span>
          </div>
          <Image 
            src="https://ui-avatars.com/api/?name=Galang&background=e60023&color=fff" 
            alt="Profile Avatar"
            width={36}
            height={36}
            className="rounded-full border border-hairline object-cover"
            unoptimized
          />
          <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-mute transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-[52px] right-0 w-64 bg-canvas border border-hairline rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.1)] p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <Link 
              href="/settings" 
              onClick={() => setIsDropdownOpen(false)} 
              className="flex items-center gap-3 p-3 hover:bg-surface-card rounded-[14px] transition-colors mb-1"
            >
              <Image 
                src="https://ui-avatars.com/api/?name=Galang&background=e60023&color=fff" 
                alt="Profile Avatar"
                width={40}
                height={40}
                className="rounded-full border border-hairline"
                unoptimized
              />
              <div>
                <p className="font-bold text-ink text-[14px]">Galang</p>
                <p className="font-medium text-mute text-xs">Admin Keluarga</p>
              </div>
            </Link>
            
            <div className="w-full h-px bg-hairline my-1" />

            <div className="space-y-1">
              <Link 
                href="/settings" 
                onClick={() => setIsDropdownOpen(false)} 
                className="flex items-center gap-2.5 p-2.5 hover:bg-surface-card rounded-[12px] transition-colors text-ink text-xs font-semibold"
              >
                <User className="w-4 h-4 text-mute" />
                <span>Pengaturan Akun</span>
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsDropdownOpen(false)} 
                className="flex items-center gap-2.5 p-2.5 hover:bg-rose-50 rounded-[12px] transition-colors text-rose-600 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Keluar</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
