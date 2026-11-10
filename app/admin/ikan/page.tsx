'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Tag,
  AlertTriangle,
  User,
} from 'lucide-react';
import { FishItem, Winner } from '@/lib/db/types';
import { formatIDR } from '@/lib/utils';
import { FishModal } from '@/components/admin/FishModal';

interface FishItemWithWinner extends FishItem {
  winner_name?: string;
}

export default function AdminIkanPage() {
  const [fishList, setFishList] = useState<FishItemWithWinner[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinnerFilter, setSelectedWinnerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fishToEdit, setFishToEdit] = useState<FishItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fishRes, winRes] = await Promise.all([
        fetch('/api/fish'),
        fetch('/api/winners'),
      ]);

      const fishData = await fishRes.json();
      const winData = await winRes.json();

      if (fishData.fishItems) setFishList(fishData.fishItems);
      if (winData.winners) setWinners(winData.winners);
    } catch (err) {
      console.error('Failed to load fish data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteFish = async (fishId: string) => {
    try {
      const res = await fetch(`/api/fish/${fishId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to delete fish item:', err);
    }
  };

  const filteredFish = fishList.filter((f) => {
    const matchesWinner =
      selectedWinnerFilter === 'all' || f.winner_id === selectedWinnerFilter;
    const matchesSearch =
      f.fish_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (f.fish_code && f.fish_code.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (f.winner_name && f.winner_name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    return matchesWinner && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
            Data Ikan Cupang Lelang
          </h2>
          <p className="text-xs text-zinc-400">
            Unggah foto, tentukan nama/kode ikan, dan masukkan harga kemenangan hasil TikTok Live.
          </p>
        </div>

        <button
          onClick={() => {
            setFishToEdit(null);
            setIsModalOpen(true);
          }}
          disabled={winners.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-950/40 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Input Ikan Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <label className="text-xs font-bold uppercase text-zinc-400 shrink-0">
            Pemenang:
          </label>
          <select
            value={selectedWinnerFilter}
            onChange={(e) => setSelectedWinnerFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
          >
            <option value="all">Semua Pemenang ({winners.length})</option>
            {winners.map((w) => (
              <option key={w.id} value={w.id}>
                {w.winner_name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari jenis, kode, atau pemenang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Fish Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 text-sm">Memuat data ikan...</div>
      ) : filteredFish.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFish.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                  <Image
                    src={item.fish_photo}
                    alt={item.fish_name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    {item.fish_code ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950/80 text-red-400 border border-zinc-800 backdrop-blur-sm">
                        <Tag className="w-2.5 h-2.5" />
                        {item.fish_code}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-400 backdrop-blur-sm">
                        NO CODE
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase">
                    <User className="w-3 h-3" />
                    <span>Pemenang: {item.winner_name}</span>
                  </div>

                  <h3 className="text-sm font-black text-white uppercase line-clamp-1">
                    {item.fish_name}
                  </h3>

                  {item.notes && (
                    <p className="text-xs text-zinc-400 line-clamp-2 italic">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="p-4 pt-0 space-y-3">
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                      Harga Menang
                    </span>
                    <span className="text-base font-black text-white font-mono">
                      {formatIDR(item.winning_price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setFishToEdit(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                      title="Edit data ikan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800"
                      title="Hapus data ikan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Confirm Delete Banner */}
                {deleteConfirmId === item.id && (
                  <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800 text-xs text-rose-300 space-y-1.5">
                    <p className="font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Hapus ikan ini?
                    </p>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleDeleteFish(item.id)}
                        className="px-2 py-0.5 rounded bg-rose-600 text-[10px] text-white font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-dashed border-zinc-800 text-zinc-500">
          Tidak ada data ikan yang sesuai pencarian/filter.
        </div>
      )}

      {/* Fish Modal */}
      <FishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        winners={winners}
        fishToEdit={fishToEdit}
      />
    </div>
  );
}
