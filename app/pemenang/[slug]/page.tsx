import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Calendar, Truck, Flame, MessageCircle } from 'lucide-react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { FishDetailCard } from '@/components/public/FishDetailCard';
import { getWinnerBySlug } from '@/lib/db/repository';
import { formatIDR, formatIndoDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWinnerBySlug(slug);

  if (!data) {
    return {
      title: 'Pemenang Tidak Ditemukan | KHOCAN BETTA FARM',
    };
  }

  return {
    title: `Pemenang Lelang: ${data.winner.winner_name} | KHOCAN BETTA FARM`,
    description: `Hasil kemenangan lelang ikan cupang ${data.winner.winner_name} sebanyak ${data.total_fish} ekor dengan total kemenangan ${formatIDR(data.total_winning_price)}.`,
  };
}

export default async function WinnerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getWinnerBySlug(slug);

  if (!data) {
    notFound();
  }

  const { winner, session, fish_items, total_winning_price, total_fish } = data;

  const fishListText = fish_items.length > 0
    ? fish_items
        .map((f, i) => `${i + 1}. ${f.fish_name}${f.fish_code ? ` (Kode: ${f.fish_code})` : ''} - ${formatIDR(f.winning_price)}`)
        .join('\n')
    : '-';

  const waMessage = `Halo Admin KHOCAN BETTA FARM,

Saya *${winner.winner_name}* ingin mengonfirmasi *${total_fish} ekor ikan* yang saya menangkan pada lelang *${session.session_name}* dengan total *${formatIDR(total_winning_price)}*.

Berikut rincian ikan yang saya menangkan:
${fishListText}

Format Konfirmasi Data Pengiriman:
- Nama Penerima: ${winner.winner_name}
- No HP / WA: 
- Alamat Lengkap: 
- Pilihan Ekspedisi: (J&T / TIKI ONS)

Mohon totalan beserta ongkir dan nomor rekening pembayarannya ya min. Terima kasih!`;

  const waUrl = `https://wa.me/6281264617864?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900/80 hover:bg-zinc-800 px-3.5 py-2 rounded-lg border border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            Kembali ke Daftar Pemenang
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">{session.session_name}</span>
          </div>
        </div>

        {/* Winner Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 mb-8 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-600 text-white">
                <Trophy className="w-3.5 h-3.5 fill-white/20" />
                PEMENANG LELANG RESMI
              </div>

              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                {winner.winner_name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Calendar className="w-4 h-4 text-red-500" />
                  Sesi: {session.session_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Truck className="w-4 h-4" />
                  Pengiriman: {formatIndoDate(session.shipping_date, { withDay: true })}
                </span>
              </div>
            </div>

            {/* Total Winning Stats Box & Top WA Button */}
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/80 border border-red-950/80 shadow-lg text-left md:text-right shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Total Kemenangan ({total_fish} Ekor)
              </span>
              <span className="text-2xl sm:text-3xl font-black text-red-500 font-mono tracking-tight block">
                {formatIDR(total_winning_price)}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                *Dihitung otomatis dari seluruh ikan
              </span>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-md shadow-emerald-950/40"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                <span>Konfirmasi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* List of Fishes Won */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                Daftar Ikan yang Dimenangkan ({fish_items.length} Ekor)
              </h2>
            </div>
          </div>

          {fish_items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {fish_items.map((item, index) => (
                <FishDetailCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-sm">
              Belum ada data ikan yang diinput untuk pemenang ini.
            </div>
          )}
        </section>

        {/* Summary Card at bottom */}
        <div className="mt-8 p-5 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-xl">
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
              BUTUH BANTUAN ATAU INGIN KONFIRMASI?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hubungi admin WhatsApp KHOCAN BETTA FARM untuk proses packing, pemilihan ekspedisi (J&amp;T / TIKI ONS), dan klaim garansi video unboxing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Konfirmasi via WhatsApp</span>
            </a>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              Lihat Pemenang Lainnya
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
