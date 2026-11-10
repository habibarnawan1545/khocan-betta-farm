'use client';

import { useState, useEffect } from 'react';
import { X, Fish, Loader2 } from 'lucide-react';
import { FishItem, Winner } from '@/lib/db/types';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface FishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  winners: Winner[];
  selectedWinnerId?: string;
  fishToEdit?: FishItem | null;
}

export function FishModal({
  isOpen,
  onClose,
  onSuccess,
  winners,
  selectedWinnerId,
  fishToEdit,
}: FishModalProps) {
  const [winnerId, setWinnerId] = useState('');
  const [fishName, setFishName] = useState('');
  const [fishCode, setFishCode] = useState('');
  const [fishPhoto, setFishPhoto] = useState('');
  const [winningPrice, setWinningPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fishToEdit) {
      setWinnerId(fishToEdit.winner_id);
      setFishName(fishToEdit.fish_name);
      setFishCode(fishToEdit.fish_code || '');
      setFishPhoto(fishToEdit.fish_photo);
      setWinningPrice(String(fishToEdit.winning_price));
      setNotes(fishToEdit.notes || '');
    } else {
      setWinnerId(selectedWinnerId || winners[0]?.id || '');
      setFishName('');
      setFishCode('');
      setFishPhoto('');
      setWinningPrice('');
      setNotes('');
    }
    setError(null);
  }, [fishToEdit, isOpen, selectedWinnerId, winners]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fishPhoto) {
      setError('Silakan upload atau masukkan foto ikan terlebih dahulu.');
      return;
    }

    const priceNum = parseInt(winningPrice.replace(/[^0-9]/g, ''), 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Harga kemenangan harus berupa nominal angka valid.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const url = fishToEdit ? `/api/fish/${fishToEdit.id}` : '/api/fish';
      const method = fishToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner_id: winnerId,
          fish_name: fishName,
          fish_code: fishCode,
          fish_photo: fishPhoto,
          winning_price: priceNum,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan data ikan');
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
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-black uppercase text-white tracking-wide mb-1 flex items-center gap-2">
          <Fish className="w-5 h-5 text-red-500" />
          {fishToEdit ? 'Edit Data Ikan Cupang' : 'Input Ikan Hasil Lelang'}
        </h2>
        <p className="text-xs text-zinc-400 mb-5">
          Data ikan akan otomatis dijumlahkan ke total kemenangan milik pemenang yang dipilih.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Pemenang yang Berhak <span className="text-red-500">*</span>
            </label>
            <select
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
            >
              {winners.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.winner_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Nama / Jenis Ikan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Blue Rim Male Grade A"
                value={fishName}
                onChange={(e) => setFishName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Kode Ikan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: BR-01"
                value={fishCode}
                onChange={(e) => setFishCode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 uppercase font-mono"
              />
            </div>
          </div>

          {/* Image Upload Component */}
          <ImageUpload
            value={fishPhoto}
            onChange={(url) => setFishPhoto(url)}
            label="Foto Ikan Cupang"
          />

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Harga Kemenangan (Rupiah) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                Rp
              </span>
              <input
                type="number"
                required
                min={0}
                step="any"
                placeholder="Contoh: 153000 (bebas nominal)"
                value={winningPrice}
                onChange={(e) => setWinningPrice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
              Keterangan / Detail Ikan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan form, ring biru, mental predator, dsb..."
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
              {fishToEdit ? 'Simpan Perubahan' : 'Simpan Ikan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
