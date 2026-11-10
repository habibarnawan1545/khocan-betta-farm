'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageCircle,
  Edit3,
  Loader2,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { AuctionSession, PaymentStatus, Winner } from '@/lib/db/types';
import { formatIDR } from '@/lib/utils';
import { PaymentStatusBadge } from '@/components/admin/PaymentStatusBadge';

interface WinnerWithMeta extends Winner {
  fish_count: number;
  total_winning_price: number;
  representative_photo: string;
}

export default function AdminPembayaranPage() {
  const [sessions, setSessions] = useState<AuctionSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [winners, setWinners] = useState<WinnerWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Note Modal
  const [selectedWinner, setSelectedWinner] = useState<WinnerWithMeta | null>(null);
  const [editStatus, setEditStatus] = useState<PaymentStatus>('unpaid');
  const [editNote, setEditNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
        const active = data.sessions.find((s: AuctionSession) => s.status === 'active');
        if (active) {
          setSelectedSessionId(active.id);
        } else if (data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const fetchWinners = async (sessionId?: string) => {
    setLoading(true);
    try {
      const targetSession = sessionId || selectedSessionId;
      const url = targetSession ? `/api/winners?session_id=${targetSession}` : '/api/winners';
      const res = await fetch(url);
      const data = await res.json();
      if (data.winners) {
        setWinners(data.winners);
      }
    } catch (err) {
      console.error('Failed to fetch winners for payment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchWinners(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleQuickStatusChange = async (winnerId: string, newStatus: PaymentStatus) => {
    try {
      const res = await fetch(`/api/payments/${winnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (res.ok) {
        await fetchWinners();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinner) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/payments/${selectedWinner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: editStatus,
          payment_note: editNote,
        }),
      });

      if (res.ok) {
        setSelectedWinner(null);
        await fetchWinners();
      }
    } catch (err) {
      console.error('Failed to save payment details:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (w: WinnerWithMeta) => {
    setSelectedWinner(w);
    setEditStatus(w.payment_status);
    setEditNote(w.payment_note || '');
  };

  // Financial statistics
  const totalRevenue = winners.reduce((sum, w) => sum + w.total_winning_price, 0);
  const paidRevenue = winners
    .filter((w) => w.payment_status === 'paid')
    .reduce((sum, w) => sum + w.total_winning_price, 0);
  const unpaidRevenue = winners
    .filter((w) => w.payment_status === 'unpaid')
    .reduce((sum, w) => sum + w.total_winning_price, 0);

  const filteredWinners = winners.filter((w) => {
    const matchesStatus = statusFilter === 'all' || w.payment_status === statusFilter;
    const matchesSearch =
      w.winner_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (w.phone_number && w.phone_number.includes(searchQuery.trim()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/40">
              <ShieldCheck className="w-3 h-3 text-red-500" />
              Khusus Petugas Admin
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
            Pengelolaan Status Pembayaran
          </h2>
          <p className="text-xs text-zinc-400">
            Seluruh catatan dan status transaksi lelang dilindungi. Pemenang yang telah lunas otomatis dialihkan ke menu Siap Dikirim.
          </p>
        </div>

        <Link
          href="/admin/pengiriman"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-950/40"
        >
          <Truck className="w-4 h-4" />
          Ikan Siap Dikirim ({winners.filter((w) => w.payment_status === 'paid').length})
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total Nilai Lelang (Sesi Terpilih)
          </span>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatIDR(totalRevenue)}
          </p>
          <span className="text-[11px] text-zinc-500">{winners.length} orang pemenang</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/60 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terbayar Lunas
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {formatIDR(paidRevenue)}
          </p>
          <span className="text-[11px] text-emerald-500">
            {winners.filter((w) => w.payment_status === 'paid').length} transaksi lunas
          </span>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Belum Bayar (Pending)
          </span>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {formatIDR(unpaidRevenue)}
          </p>
          <span className="text-[11px] text-rose-500">
            {winners.filter((w) => w.payment_status === 'unpaid').length} peserta belum bayar
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold uppercase text-zinc-400 shrink-0">
            Sesi:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 max-w-xs"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.session_name} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({winners.length})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors shrink-0 ${
              statusFilter === 'unpaid'
                ? 'bg-rose-600 text-white'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            Belum Bayar ({winners.filter((w) => w.payment_status === 'unpaid').length})
          </button>
          <button
            onClick={() => setStatusFilter('partial')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors shrink-0 ${
              statusFilter === 'partial'
                ? 'bg-amber-600 text-white'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            DP ({winners.filter((w) => w.payment_status === 'partial').length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors shrink-0 ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            Lunas ({winners.filter((w) => w.payment_status === 'paid').length})
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pemenang / no WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Pemenang &amp; Kontak</th>
                <th className="py-3.5 px-4 text-center">Ikan</th>
                <th className="py-3.5 px-4 text-right">Tagihan Total</th>
                <th className="py-3.5 px-4 text-center">Status Pembayaran</th>
                <th className="py-3.5 px-4">Catatan Transaksi</th>
                <th className="py-3.5 px-4 text-right">Ubah Cepat Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Memuat status pembayaran...
                  </td>
                </tr>
              ) : filteredWinners.length > 0 ? (
                filteredWinners.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <strong className="text-white uppercase font-bold text-sm block">
                        {w.winner_name}
                      </strong>
                      {w.phone_number ? (
                        <a
                          href={`https://wa.me/${w.phone_number.replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <MessageCircle className="w-3 h-3" />
                          {w.phone_number} (Chat WA)
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Belum ada no WA</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-zinc-300">
                      {w.fish_count} Ekor
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-red-500">
                      {formatIDR(w.total_winning_price)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <PaymentStatusBadge status={w.payment_status} />
                      {w.payment_status === 'paid' && (
                        <Link
                          href="/admin/pengiriman"
                          className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                        >
                          <Truck className="w-3 h-3" />
                          Siap Dikirim
                        </Link>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-zinc-300 italic text-[11px] line-clamp-2">
                          {w.payment_note || 'Tidak ada catatan.'}
                        </span>
                        <button
                          onClick={() => openEditModal(w)}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 shrink-0"
                          title="Edit catatan & status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Quick status button toggles */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                        <button
                          onClick={() => handleQuickStatusChange(w.id, 'unpaid')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            w.payment_status === 'unpaid'
                              ? 'bg-rose-600 text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Tandai Belum Bayar"
                        >
                          Belum
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(w.id, 'partial')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            w.payment_status === 'partial'
                              ? 'bg-amber-600 text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Tandai DP"
                        >
                          DP
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(w.id, 'paid')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            w.payment_status === 'paid'
                              ? 'bg-emerald-600 text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Tandai Lunas"
                        >
                          Lunas
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Tidak ada transaksi dengan kriteria yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payment Note Modal */}
      {selectedWinner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <h3 className="text-base font-black uppercase text-white tracking-wide mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-500" />
              Kelola Pembayaran: {selectedWinner.winner_name}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Total tagihan lelang:{' '}
              <strong className="text-white font-mono">
                {formatIDR(selectedWinner.total_winning_price)}
              </strong>
            </p>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                >
                  <option value="unpaid">Belum Bayar</option>
                  <option value="partial">Pembayaran Sebagian (DP)</option>
                  <option value="paid">Lunas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                  Catatan Transaksi / Konfirmasi
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Transfer BCA sudah masuk ke rekening owner, kirim pakai J&T Express."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedWinner(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
