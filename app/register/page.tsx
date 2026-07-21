import Link from "next/link";
import Image from "next/image";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-canvas rounded-[32px] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-hairline">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image 
              src="/assets/logo/logo-icon.png" 
              alt="GC Finance Logo" 
              width={48} 
              height={48} 
              className="rounded-full"
            />
          </Link>
        </div>
        
        <h1 className="text-[28px] font-bold text-ink text-center mb-2">Buat Akun Baru</h1>
        <p className="text-mute text-center mb-8 text-[15px]">Mulai atur keuangan keluarga tanpa ribet.</p>
        
        <form className="space-y-5">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Nama kamu" 
              className="w-full h-12 bg-surface-card border border-hairline rounded-[16px] px-4 text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">Email</label>
            <input 
              type="email" 
              placeholder="nama@email.com" 
              className="w-full h-12 bg-surface-card border border-hairline rounded-[16px] px-4 text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">Password</label>
            <input 
              type="password" 
              placeholder="Minimal 8 karakter" 
              className="w-full h-12 bg-surface-card border border-hairline rounded-[16px] px-4 text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          
          <button 
            type="button"
            className="w-full h-12 bg-brand-700 text-canvas font-bold rounded-full text-[15px] hover:bg-brand-900 transition-colors mt-4"
          >
            Daftar Sekarang
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline"></div>
          </div>
          <div className="relative flex justify-center text-[13px]">
            <span className="bg-canvas px-4 text-mute font-medium">Atau daftar dengan</span>
          </div>
        </div>

        <button 
          type="button"
          className="w-full h-12 bg-surface-card border border-hairline text-ink font-bold rounded-full text-[15px] flex items-center justify-center gap-3 hover:bg-secondary-bg transition-colors"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Daftar dengan Google
        </button>

        <p className="text-center text-[14px] text-mute mt-8 font-medium">
          Sudah punya akun? <Link href="/login" className="text-ink font-bold hover:text-brand-700 transition-colors">Masuk disini</Link>
        </p>
      </div>
    </div>
  );
}
