'use client';

import { useState, useMemo } from 'react';
import { Search, Trophy, X, Users } from 'lucide-react';
import { PublicWinner } from '@/lib/db/types';
import { WinnerCard } from './WinnerCard';

interface WinnerGridProps {
  winners: PublicWinner[];
}

export function WinnerGrid({ winners }: WinnerGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWinners = useMemo(() => {
    if (!searchQuery.trim()) return winners;
    const q = searchQuery.toLowerCase().trim();
    return winners.filter((w) => w.winner_name.toLowerCase().includes(q));
  }, [winners, searchQuery]);

  return (
    <section className="space-y-6">
      {/* Search Bar & Total Counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-3 sm:p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Ketik nama kamu untuk mencari kartu kemenangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 shrink-0 justify-center">
          <Users className="w-4 h-4 text-red-500" />
          <span>Menampilkan:</span>
          <strong className="text-white font-bold">{filteredWinners.length}</strong>
          <span className="text-zinc-500">dari {winners.length} pemenang</span>
        </div>
      </div>

      {/* Grid: 2 cols on mobile, 3-4 cols on tablet, up to 6 on desktop */}
      {filteredWinners.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredWinners.map((winner) => (
            <WinnerCard key={winner.id} winner={winner} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
            <Trophy className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Nama Tidak Ditemukan
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Tidak ada pemenang dengan nama &quot;{searchQuery}&quot; pada sesi lelang ini. Pastikan ejaan sesuai akun TikTok Anda.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Tampilkan Semua Pemenang
          </button>
        </div>
      )}
    </section>
  );
}
