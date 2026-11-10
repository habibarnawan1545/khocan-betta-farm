'use client';

import { useState, useEffect } from 'react';
import { X, Users, Loader2, MapPin } from 'lucide-react';
import { Winner, AuctionSession, PaymentStatus } from '@/lib/db/types';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (winner?: any) => void;
  sessions: AuctionSession[];
  activeSessionId?: string;
  winnerToEdit?: Winner | null;
}

export function WinnerModal({
  isOpen,
  onClose,
  onSuccess,
  sessions,
  activeSessionId,
  winnerToEdit,
}: WinnerModalProps) {
  const [sessionId, setSessionId] = useState('');
  const [winnerName, setWinnerName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (winnerToEdit) {
      setSessionId(winnerToEdit.session_id);
      setWinnerName(winnerToEdit.winner_name);
      setRecipientName(winnerToEdit.recipient_name || '');
      setPhoneNumber(winnerToEdit.phone_number || '');
      setShippingAddress(winnerToEdit.shipping_address || '');
      setPaymentStatus(winnerToEdit.payment_status);
      setPaymentNote(winnerToEdit.payment_note || '');
    } else {
      setSessionId(activeSessionId || sessions[0]?.id || '');
      setWinnerName('');
      setRecipientName('');
      setPhoneNumber('');
      setShippingAddress('');
      setPaymentStatus('unpaid');
      setPaymentNote('');
    }
    setError(null);
  }, [winnerToEdit, isOpen, activeSessionId, sessions]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url = winnerToEdit ? `/api/winners/${winnerToEdit.id}` : '/api/winners';
      const method = winnerToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          winner_name: winnerName,
          recipient_name: recipientName,
          phone_number: phoneNumber,
          shipping_address: shippingAddress,
          payment_status: paymentStatus,
          payment_note: paymentNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan data pemenang');
      }

      onSuccess(data.winner);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-7 my-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          {winnerToEdit ? 'Edit Data Pemenang' : 'Tambah Pemenang Baru'}
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          {winnerToEdit
            ? 'Perbarui data pemenang, nama penerima, alamat, atau status pembayaran.'
            : 'Masukkan nama akun TikTok pemenang lelang. Data alamat pengiriman bisa diisi sekarang atau belakangan.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Pilih Sesi Lelang <span className="text-red-500">*</span>
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={Boolean(winnerToEdit)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-60"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.session_name} ({s.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Akun TikTok Pemenang (Untuk Ditandai di Kotak Packing) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: @belfrik.betta atau IDRIS YU"
              value={winnerName}
              onChange={(e) => setWinnerName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 uppercase font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Nama Penerima Paket (Opsional)
              </label>
              <input
                type="text"
                placeholder="Nama asli penerima"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                No HP / WA Penerima (Opsional)
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081264617864"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Alamat Pengiriman (Opsional - Ditulis di Kotak Packing) */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Alamat Pengiriman Lengkap (Opsional)
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Boleh Dikosongkan Dulu</span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Data ini untuk ditulis langsung pada kotak packing. Bisa diisi nanti setelah pemenang konfirmasi via WhatsApp.
            </p>

            <textarea
              rows={3}
              placeholder="Contoh: Jl. Merdeka No. 12, RT 02/05, Kel. Sukamaju, Kec. Cilodong, Kota Depok, Jawa Barat 16413"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Status Pembayaran */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Status Pembayaran (Internal Admin Only)
            </span>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Status Bayar
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
              >
                <option value="unpaid">Belum Bayar</option>
                <option value="partial">Pembayaran Sebagian (DP)</option>
                <option value="paid">Lunas (Otomatis masuk ke Siap Dikirim)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Catatan Pembayaran
              </label>
              <input
                type="text"
                placeholder="Contoh: Transfer BCA lunas + ongkir"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
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
              {winnerToEdit ? 'Simpan Perubahan' : 'Tambah Pemenang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
