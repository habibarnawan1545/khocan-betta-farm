import { Calendar, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { AuctionSession } from '@/lib/db/types';
import { formatIndoDate } from '@/lib/utils';

interface SessionBannerProps {
  session: AuctionSession | null;
  winnerCount: number;
}

export function SessionBanner({ session, winnerCount }: SessionBannerProps) {
  if (!session) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 text-center my-6">
        <h2 className="text-2xl font-black tracking-wider text-white uppercase mb-2">
          BELUM ADA SESI LELANG AKTIF
        </h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Saat ini belum ada sesi lelang yang dipublikasikan. Silakan ikuti siaran TikTok Live KHOCAN BETTA FARM untuk jadwal lelang berikutnya.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/90 p-5 sm:p-8 mb-8 shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-600 text-white">
              <Sparkles className="w-3.5 h-3.5" />
              Sesi Resmi Aktif
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {winnerCount} Peserta Menang
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide text-white">
              HASIL LELANG
            </h1>
            <p className="text-red-400 font-bold text-base sm:text-lg tracking-wide mt-0.5">
              {session.session_name}
            </p>
          </div>

          {session.notes && (
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {session.notes}
            </p>
          )}
        </div>

        {/* Schedule & Shipping Badges */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Periode Lelang
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white">
                {formatIndoDate(session.start_date, { shortMonth: true })} – {formatIndoDate(session.end_date, { shortMonth: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider block">
                Jadwal Pengiriman
              </span>
              <span className="text-xs sm:text-sm font-bold text-white">
                {formatIndoDate(session.shipping_date, { withDay: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
