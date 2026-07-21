import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-soft overflow-hidden font-sans text-body">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-canvas border-b border-hairline">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-[1280px]">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/assets/logo/logo-icon.png" 
                alt="GC Finance Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8 rounded-full"
              />
              <Image 
                src="/assets/logo/logo-wordmark.png" 
                alt="GC Finance" 
                width={120} 
                height={24} 
                className="h-5 w-auto hidden sm:block"
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-base font-semibold text-ink hover:bg-secondary-bg px-4 py-2 rounded-full transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="h-10 inline-flex items-center justify-center rounded-md bg-primary px-4 text-[14px] font-bold text-primary-foreground hover:bg-primary-pressed transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-6 text-center">
          <div className="container mx-auto max-w-[1000px]">
            <h1 className="text-[56px] md:text-[70px] font-semibold text-ink leading-[1.1] tracking-[-1.2px] max-w-[900px] mx-auto">
              Atur Keuangan Keluarga & Personal Tanpa Ribet
            </h1>
            <p className="mt-8 text-xl text-body max-w-2xl mx-auto leading-[1.4]">
              Satu aplikasi, sinkronisasi instan, pencatatan otomatis via Telegram dengan Voice Note & Foto Struk.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-[16px] font-bold text-primary-foreground hover:bg-primary-pressed transition-colors shadow-lg shadow-primary/20"
              >
                Mulai Gratis Sekarang
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-full bg-surface-card border border-hairline px-8 text-[16px] font-bold text-ink hover:bg-secondary-bg transition-colors"
              >
                Lihat Demo UI
              </Link>
            </div>
            
            {/* Features Mini Banner */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[14px] font-semibold text-mute">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-700" />
                <span>Tanpa Kartu Kredit</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-700" />
                <span>Data Aman & Terisolasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-700" />
                <span>AI OCR Otomatis</span>
              </div>
            </div>
          </div>
          
          {/* Prominent UI/UX Mockup */}
          <div className="container mx-auto max-w-[1100px] mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-700/10 to-transparent blur-3xl -z-10 rounded-full" />
            <div className="bg-canvas border border-hairline rounded-[32px] p-2 shadow-[0_32px_64px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="bg-surface-soft rounded-[28px] overflow-hidden border border-hairline relative aspect-video flex items-center justify-center">
                <Image
                  src="/assets/images/mockup-ui.webp"
                  alt="GC Financial Tracker UI"
                  fill
                  className="object-cover opacity-0 transition-opacity duration-500"
                  onLoadingComplete={(img) => img.classList.remove('opacity-0')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200&h=700";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-canvas/90 backdrop-blur border border-hairline px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-bold text-ink text-[14px]">Real-time Sync dengan Telegram</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards / Image Area (Pinterest masonry style inspired) */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-[1280px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-canvas rounded-[32px] p-10 flex flex-col justify-center border border-hairline shadow-sm">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-brand-700" />
                </div>
                <h3 className="text-[32px] font-bold tracking-[-1.2px] text-ink leading-[1.2]">
                  Catat via Voice Note Telegram
                </h3>
                <p className="mt-4 text-[18px] text-body leading-[1.5]">
                  Cukup bilang "Jajan Kopi 25 ribu" ke bot Telegram. AI kami akan otomatis mengkategorikan dan memasukkannya ke pengeluaran.
                </p>
              </div>
              <div className="bg-surface-card rounded-[16px] p-0 h-[500px] flex items-center justify-center relative overflow-hidden">
                <Image 
                  src="/assets/images/plus-button.png" 
                  alt="Tambah Transaksi" 
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6 bg-canvas rounded-full px-4 py-2 font-bold text-[14px] text-ink shadow-sm">
                  Interaktif
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-16">
              <div className="bg-surface-card rounded-[16px] p-0 h-[500px] flex items-center justify-center relative overflow-hidden order-2 md:order-1">
                 <div className="absolute inset-0 bg-secondary-bg flex items-center justify-center">
                  <p className="font-semibold text-ash">Mockup OCR UI</p>
                </div>
              </div>
              <div className="bg-canvas rounded-[16px] p-8 flex flex-col justify-center order-1 md:order-2">
                <h3 className="text-[28px] font-bold tracking-[-1.2px] text-ink leading-[1.2]">
                  OCR Scan Struk
                </h3>
                <p className="mt-4 text-[16px] text-body leading-[1.4]">
                  Foto struk belanjamu dan AI kami akan mendata secara ajaib. Hemat waktu, rapi, dan instan.
                </p>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-[14px] font-bold text-primary-foreground hover:bg-primary-pressed transition-colors"
                  >
                    Coba AI OCR
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 bg-canvas">
          <div className="container mx-auto max-w-[1280px]">
            <div className="text-center mb-16">
              <h2 className="text-[44px] font-bold text-ink leading-[1.15] tracking-[-0.8px]">
                Pilih Paket Sesuai Kebutuhanmu
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Personal Plan */}
              <div className="rounded-[16px] bg-surface-card p-10 flex flex-col">
                <h3 className="text-[22px] font-semibold text-ink">Personal Plan</h3>
                <div className="mt-6 flex items-baseline text-ink">
                  <span className="text-[44px] font-bold tracking-[-0.8px] leading-none">Rp 15.000</span>
                  <span className="ml-1 text-[16px] font-semibold text-mute">/ bln</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>1 Akun Personal</span>
                  </li>
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>Catat via Telegram Text</span>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="mt-10 h-10 flex items-center justify-center w-full rounded-md bg-secondary-bg text-[14px] font-bold text-ink hover:bg-[#c8c8c1] transition-colors"
                >
                  Pilih Personal
                </Link>
              </div>

              {/* Family Plan */}
              <div className="rounded-[16px] border-[1px] border-primary bg-surface-card p-10 flex flex-col relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[12px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Paling Laris
                </div>
                <h3 className="text-[22px] font-semibold text-ink">Family Plan</h3>
                <div className="mt-6 flex items-baseline text-ink">
                  <span className="text-[44px] font-bold tracking-[-0.8px] leading-none">Rp 29.000</span>
                  <span className="ml-1 text-[16px] font-semibold text-mute">/ bln</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>Hingga 5 Anggota Keluarga</span>
                  </li>
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>Fitur Voice Note Telegram</span>
                  </li>
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>Scan Struk Belanja (AI OCR)</span>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="mt-10 h-10 flex items-center justify-center w-full rounded-md bg-primary text-[14px] font-bold text-primary-foreground hover:bg-primary-pressed transition-colors"
                >
                  Pilih Family
                </Link>
              </div>

              {/* Lifetime Plan */}
              <div className="rounded-[16px] bg-surface-card p-10 flex flex-col">
                <h3 className="text-[22px] font-semibold text-ink">Lifetime Deal</h3>
                <div className="mt-6 flex items-baseline text-ink">
                  <span className="text-[44px] font-bold tracking-[-0.8px] leading-none">Rp 199k</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>Semua fitur Family Plan</span>
                  </li>
                  <li className="flex items-start gap-3 text-[16px] text-body">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <span>Free upgrade selamanya</span>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="mt-10 h-10 flex items-center justify-center w-full rounded-md bg-secondary-bg text-[14px] font-bold text-ink hover:bg-[#c8c8c1] transition-colors"
                >
                  Ambil Lifetime
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-canvas py-8 px-6">
        <div className="container mx-auto max-w-[1280px] grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-[14px] text-ink mb-4">Produk</div>
            <ul className="space-y-3 text-[14px] text-mute">
              <li><Link href="#" className="hover:text-ink">Fitur</Link></li>
              <li><Link href="#" className="hover:text-ink">Harga</Link></li>
              <li><Link href="#" className="hover:text-ink">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-[14px] text-ink mb-4">Perusahaan</div>
            <ul className="space-y-3 text-[14px] text-mute">
              <li><Link href="#" className="hover:text-ink">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-ink">Kontak</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/assets/logo/logo-wordmark.png" alt="GC Finance" width={100} height={20} className="h-4 w-auto" />
              </div>
              <p className="text-[12px] text-mute">© 2026 GC Financial Tracker. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
