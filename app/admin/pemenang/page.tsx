'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Fish,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { AuctionSession, Winner } from '@/lib/db/types';
import { formatIDR } from '@/lib/utils';
import { PaymentStatusBadge } from '@/components/admin/PaymentStatusBadge';
import { WinnerModal } from '@/components/admin/WinnerModal';
import { FishModal } from '@/components/admin/FishModal';

interface WinnerWithMeta extends Winner {
  fish_count: number;
  total_winning_price: number;
  representative_photo: string;
}

export default function AdminPemenangPage() {
  const [sessions, setSessions] = useState<AuctionSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [winners, setWinners] = useState<WinnerWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [winnerToEdit, setWinnerToEdit] = useState<Winner | null>(null);

  const [isFishModalOpen, setIsFishModalOpen] = useState(false);
  const [fishWinnerId, setFishWinnerId] = useState<string | undefined>(undefined);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
      console.error('Failed to fetch winners:', err);
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

  const handleDeleteWinner = async (winnerId: string) => {
    try {
      const res = await fetch(`/api/winners/${winnerId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchWinners();
      }
    } catch (err) {
      console.error('Failed to delete winner:', err);
    }
  };

  const filteredWinners = winners.filter((w) =>
    w.winner_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
            Data Pemenang Lelang
          </h2>
          <p className="text-xs text-zinc-400">
            Setiap pemenang hanya perlu dibuat satu kali per sesi. Seluruh ikan yang dimenangkan orang tersebut akan dikelompokkan secara otomatis.
          </p>
        </div>

        <button
          onClick={() => {
            setWinnerToEdit(null);
            setIsWinnerModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-950/40"
        >
          <Plus className="w-4 h-4" />
          Tambah Pemenang Baru
        </button>
      </div>

      {/* Session Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <label className="text-xs font-bold uppercase text-zinc-400 shrink-0">
            Pilih Sesi:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.session_name} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pemenang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Winners Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Pemenang</th>
                <th className="py-3 px-4">Slug Publik</th>
                <th className="py-3 px-4 text-center">Jumlah Ikan</th>
                <th className="py-3 px-4 text-right">Total Kemenangan</th>
                <th className="py-3 px-4 text-center">Status Bayar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Memuat data pemenang...
                  </td>
                </tr>
              ) : filteredWinners.length > 0 ? (
                filteredWinners.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Name & Photo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                          {w.representative_photo ? (
                            <Image
                              src={w.representative_photo}
                              alt={w.winner_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Fish className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <strong className="text-white uppercase font-bold text-sm block">
                            {w.winner_name}
                          </strong>
                          {w.recipient_name && (
                            <span className="text-[11px] text-zinc-400 block font-normal">
                              Penerima: {w.recipient_name}
                            </span>
                          )}
                          {w.phone_number ? (
                            <a
                              href={`https://wa.me/${w.phone_number.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              {w.phone_number}
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-500">No WhatsApp</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      <Link
                        href={`/pemenang/${w.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 hover:text-red-400 transition-colors"
                      >
                        <span>/{w.slug}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </Link>
                    </td>

                    {/* Fish count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 font-bold text-xs">
                        {w.fish_count} Ekor
                      </span>
                    </td>

                    {/* Total winning price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-red-500">
                      {formatIDR(w.total_winning_price)}
                    </td>

                    {/* Payment status badge */}
                    <td className="py-3.5 px-4 text-center">
                      <PaymentStatusBadge status={w.payment_status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setFishWinnerId(w.id);
                            setIsFishModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Tambah ikan untuk pemenang ini"
                        >
                          <Plus className="w-3.5 h-3.5 text-red-500" />
                          <span>Ikan</span>
                        </button>

                        <button
                          onClick={() => {
                            setWinnerToEdit(w);
                            setIsWinnerModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                          title="Edit pemenang"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(w.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800"
                          title="Hapus pemenang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Confirm delete prompt */}
                      {deleteConfirmId === w.id && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-950 border border-rose-800 text-left space-y-1">
                          <p className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Hapus {w.winner_name}?
                          </p>
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleDeleteWinner(w.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 text-[10px] text-white font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Tidak ada data pemenang untuk sesi yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Winner Modal */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        onSuccess={(created) => {
          if (created?.session_id && created.session_id !== selectedSessionId) {
            setSelectedSessionId(created.session_id);
          } else {
            fetchWinners(selectedSessionId);
          }
        }}
        sessions={sessions}
        activeSessionId={selectedSessionId}
        winnerToEdit={winnerToEdit}
      />

      {/* Fish Modal for Quick Add */}
      <FishModal
        isOpen={isFishModalOpen}
        onClose={() => setIsFishModalOpen(false)}
        onSuccess={() => fetchWinners()}
        winners={winners}
        selectedWinnerId={fishWinnerId}
      />
    </div>
  );
}
