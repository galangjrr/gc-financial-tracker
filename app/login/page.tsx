import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";

export default function LoginPage() {
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
        
        <h1 className="text-[28px] font-bold text-ink text-center mb-2">Masuk ke Akun</h1>
        <p className="text-mute text-center mb-8 text-[15px]">Lanjutkan pencatatan keuanganmu hari ini.</p>
        
        <form className="space-y-5">
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
              placeholder="••••••••" 
              className="w-full h-12 bg-surface-card border border-hairline rounded-[16px] px-4 text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <div className="flex justify-end">
            <Link href="#" className="text-[13px] font-semibold text-brand-700 hover:text-brand-900 transition-colors">
              Lupa Password?
            </Link>
          </div>
          <button 
            type="button"
            className="w-full h-12 bg-ink text-canvas font-bold rounded-full text-[15px] hover:bg-ink-soft transition-colors mt-2"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline"></div>
          </div>
          <div className="relative flex justify-center text-[13px]">
            <span className="bg-canvas px-4 text-mute font-medium">Atau masuk dengan</span>
          </div>
        </div>

        <button 
          type="button"
          className="w-full h-12 bg-surface-card border border-hairline text-ink font-bold rounded-full text-[15px] flex items-center justify-center gap-3 hover:bg-secondary-bg transition-colors"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Masuk dengan Google
        </button>

        <p className="text-center text-[14px] text-mute mt-8 font-medium">
          Belum punya akun? <Link href="/register" className="text-brand-700 font-bold hover:text-brand-900 transition-colors">Daftar disini</Link>
        </p>
      </div>
    </div>
  );
}
