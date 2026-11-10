'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Truck,
  CheckCircle2,
  Archive,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AuctionSession, SessionStatus } from '@/lib/db/types';
import { formatIndoDate } from '@/lib/utils';
import { SessionModal } from '@/components/admin/SessionModal';

export default function AdminSesiPage() {
  const [sessions, setSessions] = useState<AuctionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<AuctionSession | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStatusChange = async (sessionId: string, newStatus: SessionStatus) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchSessions();
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchSessions();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
            Kelola Sesi Lelang
          </h2>
          <p className="text-xs text-zinc-400">
            Hanya satu sesi yang boleh berstatus Aktif untuk ditampilkan kepada publik. Data sesi lama tersimpan aman dalam arsip.
          </p>
        </div>

        <button
          onClick={() => {
            setSessionToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-950/40"
        >
          <Plus className="w-4 h-4" />
          Buat Sesi Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-1 sm:space-x-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-3 sm:px-4 text-xs font-bold uppercase transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-red-600 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Semua Sesi ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 px-3 sm:px-4 text-xs font-bold uppercase transition-colors border-b-2 ${
            activeTab === 'active'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Aktif ({sessions.filter((s) => s.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`py-2 px-3 sm:px-4 text-xs font-bold uppercase transition-colors border-b-2 ${
            activeTab === 'closed'
              ? 'border-zinc-500 text-zinc-200'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Ditutup ({sessions.filter((s) => s.status === 'closed').length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`py-2 px-3 sm:px-4 text-xs font-bold uppercase transition-colors border-b-2 ${
            activeTab === 'archived'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Arsip ({sessions.filter((s) => s.status === 'archived').length})
        </button>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-sm">Memuat daftar sesi...</div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const isActive = session.status === 'active';
            const isArchived = session.status === 'archived';

            return (
              <div
                key={session.id}
                className={`p-5 rounded-2xl bg-zinc-900 border flex flex-col justify-between transition-all duration-200 ${
                  isActive
                    ? 'border-emerald-600/70 shadow-lg shadow-emerald-950/20'
                    : isArchived
                    ? 'border-zinc-800/60 opacity-80'
                    : 'border-zinc-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isActive
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : isArchived
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isActive ? '● SEDANG AKTIF (PUBLIK)' : session.status.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSessionToEdit(session);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                        title="Edit sesi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(session.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800"
                        title="Hapus sesi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-wide">
                      {session.session_name}
                    </h3>
                    {session.notes && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 italic">
                        &ldquo;{session.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Periode:</span>
                      <span className="text-zinc-200 font-semibold">
                        {formatIndoDate(session.start_date, { shortMonth: true })} –{' '}
                        {formatIndoDate(session.end_date, { shortMonth: true })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Pengiriman:</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        {formatIndoDate(session.shipping_date, { withDay: true })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switch Actions */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex flex-wrap gap-2">
                  {!isActive && (
                    <button
                      onClick={() => handleStatusChange(session.id, 'active')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/40 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktifkan ke Publik
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={() => handleStatusChange(session.id, 'closed')}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Tutup Sesi
                    </button>
                  )}

                  {!isArchived && (
                    <button
                      onClick={() => handleStatusChange(session.id, 'archived')}
                      className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                      title="Arsipkan sesi lama"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Arsip
                    </button>
                  )}
                </div>

                {/* Confirm Delete Banner */}
                {deleteConfirmId === session.id && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-xs text-rose-300 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Yakin ingin menghapus sesi ini?
                    </p>
                    <p className="text-[11px] text-rose-400">
                      Seluruh pemenang dan data ikan di sesi ini akan ikut terhapus.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                      >
                        Ya, Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-dashed border-zinc-800 text-zinc-500">
          Tidak ada sesi dalam kategori ini.
        </div>
      )}

      {/* Modal for Create/Edit */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSessions}
        sessionToEdit={sessionToEdit}
      />
    </div>
  );
}
