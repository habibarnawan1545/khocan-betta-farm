import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  Users,
  Fish,
  CreditCard,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { getDashboardStats, getAdminWinners } from '@/lib/db/repository';
import { formatIDR, formatIndoDate } from '@/lib/utils';
import { PaymentStatusBadge } from '@/components/admin/PaymentStatusBadge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('khocan_admin_session');

  if (!sessionCookie?.value) {
    redirect('/admin/login');
  }

  const stats = await getDashboardStats();
  const winners = await getAdminWinners(stats.active_session?.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block">
            Panel Kontrol Administrator
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-0.5">
            KHOCAN BETTA FARM
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau dan kelola seluruh publikasi hasil lelang live streaming TikTok, data pemenang, dan pembayaran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/pengiriman"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-emerald-950/40"
          >
            <Truck className="w-3.5 h-3.5" />
            Siap Dikirim ({stats.ready_to_ship_count ?? stats.paid_winners_count})
          </Link>
          <Link
            href="/admin/pemenang"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-red-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Pemenang
          </Link>
          <Link
            href="/admin/ikan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Fish className="w-3.5 h-3.5" />
            Input Ikan
          </Link>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sesi */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sesi Lelang</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.total_sessions}
            </span>
            <span className="text-xs text-zinc-500">sesi tercatat</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span>Sesi Aktif:</span>
            <strong className="text-emerald-400">{stats.active_session ? 'Ada (1)' : 'Tidak Ada'}</strong>
          </div>
        </div>

        {/* Total Pemenang */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pemenang</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.total_winners}
            </span>
            <span className="text-xs text-zinc-500">orang pemenang</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span>Pada Sesi Aktif:</span>
            <strong className="text-white font-bold">{winners.length} orang</strong>
          </div>
        </div>

        {/* Total Ikan Terjual */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Ikan Terjual</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Fish className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.total_fish_sold}
            </span>
            <span className="text-xs text-zinc-500">ekor ikan</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span>Rata-rata/Pemenang:</span>
            <strong className="text-white font-bold">
              {stats.total_winners > 0
                ? (stats.total_fish_sold / stats.total_winners).toFixed(1)
                : 0}{' '}
              ekor
            </strong>
          </div>
        </div>

        {/* Total Nilai Kemenangan (Revenue) */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-red-950/60 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Total Nilai Kemenangan
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-red-500 font-mono">
              {formatIDR(stats.total_revenue)}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span>Status Data:</span>
            <strong className="text-zinc-300">Tercatat Akurat</strong>
          </div>
        </div>
      </div>

      {/* Active Session Spotlight & Payment Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Session Status Box */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-red-500" />
              Sesi Lelang yang Sedang Aktif
            </h3>
            <Link
              href="/admin/sesi"
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              Kelola Sesi ↗
            </Link>
          </div>

          {stats.active_session ? (
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                    ● AKTIF DITAMPILKAN KE PUBLIK
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white uppercase">
                    {stats.active_session.session_name}
                  </h4>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-bold uppercase shrink-0">
                  Status: Active
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-900 text-xs">
                <div>
                  <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                    Periode Lelang
                  </span>
                  <span className="text-zinc-200 font-semibold">
                    {formatIndoDate(stats.active_session.start_date)} s/d{' '}
                    {formatIndoDate(stats.active_session.end_date)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase font-bold text-[10px]">
                    Jadwal Pengiriman Paket Ikan
                  </span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    {formatIndoDate(stats.active_session.shipping_date, { withDay: true })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-zinc-950 border border-dashed border-zinc-800">
              <p className="text-xs text-zinc-400 mb-3">
                Saat ini belum ada sesi lelang yang berstatus &quot;Active&quot;. Pengunjung tidak melihat daftar pemenang aktif.
              </p>
              <Link
                href="/admin/sesi"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Aktifkan Sesi Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Payment Breakdown Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-500" />
                Status Pembayaran
              </h3>
              <Link
                href="/admin/pembayaran"
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Lihat Semua ↗
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-emerald-950/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-300">Lunas</span>
                </div>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {stats.paid_winners_count} Orang
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-amber-950/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-zinc-300">Sebagian (DP)</span>
                </div>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {stats.partial_winners_count} Orang
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-rose-950/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-zinc-300">Belum Bayar</span>
                </div>
                <span className="text-sm font-black text-rose-400 font-mono">
                  {stats.unpaid_winners_count} Orang
                </span>
              </div>
            </div>

            <Link
              href="/admin/pengiriman"
              className="mt-3 flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                Ikan Siap Dikirim
              </span>
              <span className="text-xs font-mono font-bold">
                {stats.ready_to_ship_count ?? stats.paid_winners_count} Paket Siap ↗
              </span>
            </Link>
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            *Data pembayaran sepenuhnya rahasia dan tidak ditampilkan pada halaman publik atau API publik.
          </p>
        </div>
      </div>

      {/* Recent Winners Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              Daftar Pemenang Sesi Aktif ({winners.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Data pemenang yang saat ini ditampilkan pada halaman utama website publik.
            </p>
          </div>
          <Link
            href="/admin/pemenang"
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            Buka Kelola Pemenang <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Nama Pemenang</th>
                <th className="py-3 px-3">Slug URL</th>
                <th className="py-3 px-3 text-center">Jumlah Ikan</th>
                <th className="py-3 px-3 text-right">Total Kemenangan</th>
                <th className="py-3 px-3 text-center">Status Bayar</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {winners.length > 0 ? (
                winners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-white uppercase font-bold block">
                        {winner.winner_name}
                      </strong>
                      {winner.phone_number && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {winner.phone_number}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      /pemenang/{winner.slug}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-zinc-200">
                      {winner.fish_count} Ekor
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-red-400">
                      {formatIDR(winner.total_winning_price)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <PaymentStatusBadge status={winner.payment_status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/pemenang/${winner.slug}`}
                        target="_blank"
                        className="text-xs text-zinc-400 hover:text-white underline"
                      >
                        Lihat Publik
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Belum ada data pemenang pada sesi lelang ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
