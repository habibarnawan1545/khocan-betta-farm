import Link from 'next/link';
import { Flame, Calendar, Truck, ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-12 border-b border-zinc-900">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Flame className="w-5 h-5 fill-white/20" />
              </div>
              <span className="text-base font-bold tracking-wider text-white uppercase">
                KHOCAN <span className="text-red-500">BETTA</span> FARM
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Pusat lelang ikan cupang hias berkualitas tinggi. Menyediakan beragam jenis Plakat, Halfmoon, Crown Tail, Blue Rim, Avatar, Nemo Galaxy, dan koleksi kontes pilihan.
            </p>
          </div>

          {/* Auction & Shipping Schedule Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              Jadwal Lelang & Pengiriman
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-200">Lelang Senin–Selasa:</strong> Pengiriman dilakukan hari <strong>Rabu</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-200">Lelang Kamis–Jumat:</strong> Pengiriman dilakukan hari <strong>Sabtu</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span><strong className="text-zinc-200">Lelang Sabtu–Minggu:</strong> Pengiriman dilakukan hari <strong>Senin</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Important Notice */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Catatan Penting Peserta
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Website ini murni katalog digital untuk mempublikasikan pemenang lelang TikTok Live. Penawaran dilakukan langsung saat streaming. Konfirmasi pembayaran dan packing ikan dilakukan melalui kontak WhatsApp resmi KHOCAN BETTA FARM.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} KHOCAN BETTA FARM. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Beranda Hasil Lelang
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-zinc-300 transition-colors">
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
