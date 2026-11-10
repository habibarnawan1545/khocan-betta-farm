import Link from 'next/link';
import { Flame, ShieldCheck, Radio } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform duration-200">
              <Flame className="w-6 h-6 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-wider text-white uppercase font-sans">
                  KHOCAN <span className="text-red-500">BETTA</span> FARM
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-950/70 text-red-400 border border-red-800/40">
                  <Radio className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                  TikTok Live
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-medium tracking-tight">
                Katalog Resmi Hasil Lelang Ikan Cupang
              </p>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-zinc-400">Status:</span>
              <span className="font-semibold text-emerald-400">Sesi Terverifikasi</span>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-all duration-150"
              title="Dashboard Petugas Admin"
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
