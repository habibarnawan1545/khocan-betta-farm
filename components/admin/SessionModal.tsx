'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { AuctionSession, SessionStatus } from '@/lib/db/types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionToEdit?: AuctionSession | null;
}

export function SessionModal({ isOpen, onClose, onSuccess, sessionToEdit }: SessionModalProps) {
  const [sessionName, setSessionName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [status, setStatus] = useState<SessionStatus>('closed');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionToEdit) {
      setSessionName(sessionToEdit.session_name);
      setStartDate(sessionToEdit.start_date.split('T')[0]);
      setEndDate(sessionToEdit.end_date.split('T')[0]);
      setShippingDate(sessionToEdit.shipping_date.split('T')[0]);
      setStatus(sessionToEdit.status);
      setNotes(sessionToEdit.notes || '');
    } else {
      setSessionName('');
      setStartDate('');
      setEndDate('');
      setShippingDate('');
      setStatus('closed');
      setNotes('');
    }
    setError(null);
  }, [sessionToEdit, isOpen]);

  if (!isOpen) return null;

  // Preset helper for the 3 official patterns
  const applyPreset = (pattern: 'senin_rabu' | 'kamis_sabtu' | 'sabtu_senin') => {
    const today = new Date();
    // Default format helper
    const toYMD = (d: Date) => d.toISOString().split('T')[0];

    if (pattern === 'senin_rabu') {
      setSessionName(`LELANG SENIN–SELASA KHOCAN BETTA`);
      setStartDate(toYMD(today));
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      setEndDate(toYMD(end));
      const ship = new Date(today);
      ship.setDate(ship.getDate() + 2);
      setShippingDate(toYMD(ship));
    } else if (pattern === 'kamis_sabtu') {
      setSessionName(`LELANG KAMIS–JUMAT KHOCAN BETTA`);
      setStartDate(toYMD(today));
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      setEndDate(toYMD(end));
      const ship = new Date(today);
      ship.setDate(ship.getDate() + 2);
      setShippingDate(toYMD(ship));
    } else if (pattern === 'sabtu_senin') {
      setSessionName(`LELANG SABTU–MINGGU KHOCAN BETTA`);
      setStartDate(toYMD(today));
      const end = new Date(today);
      end.setDate(end.getDate() + 1);
      setEndDate(toYMD(end));
      const ship = new Date(today);
      ship.setDate(ship.getDate() + 2);
      setShippingDate(toYMD(ship));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url = sessionToEdit ? `/api/sessions/${sessionToEdit.id}` : '/api/sessions';
      const method = sessionToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_name: sessionName,
          start_date: startDate,
          end_date: endDate,
          shipping_date: shippingDate,
          status,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan sesi');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-black uppercase text-white tracking-wide mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-red-500" />
          {sessionToEdit ? 'Edit Sesi Lelang' : 'Buat Sesi Lelang Baru'}
        </h2>
        <p className="text-xs text-zinc-400 mb-5">
          {sessionToEdit
            ? 'Perbarui detail sesi atau ubah status sesi lelang.'
            : 'Pilih preset jadwal resmi atau masukkan tanggal secara manual.'}
        </p>

        {/* Quick Presets (Only when creating new) */}
        {!sessionToEdit && (
          <div className="mb-5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pola Jadwal Resmi Khocan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('senin_rabu')}
                className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white"
              >
                <strong className="block text-white">Senin–Selasa</strong>
                Kirim: Rabu
              </button>
              <button
                type="button"
                onClick={() => applyPreset('kamis_sabtu')}
                className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white"
              >
                <strong className="block text-white">Kamis–Jumat</strong>
                Kirim: Sabtu
              </button>
              <button
                type="button"
                onClick={() => applyPreset('sabtu_senin')}
                className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white"
              >
                <strong className="block text-white">Sabtu–Minggu</strong>
                Kirim: Senin
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Nama Sesi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: LELANG KAMIS–JUMAT, 05–06 NOVEMBER 2026"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Tanggal Pengiriman <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Status Sesi <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SessionStatus)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
            >
              <option value="closed">Closed (Ditutup - Tidak menerima input baru)</option>
              <option value="active">Active (Aktif - Ditampilkan pada halaman publik)</option>
              <option value="archived">Archived (Diarsipkan - Disimpan sebagai riwayat)</option>
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              *Hanya satu sesi yang boleh Aktif. Mengaktifkan sesi ini akan otomatis menutup sesi aktif sebelumnya.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Catatan / Keterangan Sesi
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan untuk sesi lelang ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {sessionToEdit ? 'Simpan Perubahan' : 'Buat Sesi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
