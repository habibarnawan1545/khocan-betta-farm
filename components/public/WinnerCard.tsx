import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Trophy } from 'lucide-react';
import { PublicWinner } from '@/lib/db/types';

interface WinnerCardProps {
  winner: PublicWinner;
}

export function WinnerCard({ winner }: WinnerCardProps) {
  const PLACEHOLDER = 'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80';
  const photo = winner.representative_photo?.trim() || PLACEHOLDER;

  return (
    <Link
      href={`/pemenang/${winner.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900/90 border border-zinc-800/80 hover:border-red-600/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-950/30"
    >
      {/* Representative Fish Photo */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        <Image
          src={photo}
          alt={`Ikan dimenangkan oleh ${winner.winner_name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
          loading="lazy"
        />

        {/* Fish Count Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-950/80 text-white border border-zinc-700/60 backdrop-blur-md">
            <Trophy className="w-2.5 h-2.5 text-amber-400" />
            {winner.fish_count} Ekor
          </span>
        </div>

        {/* Bottom subtle gradient shadow on image */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
      </div>

      {/* Winner Details */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
            Pemenang
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-red-400 transition-colors">
            {winner.winner_name}
          </h3>
        </div>

        {/* Lihat Detail Indicator */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
          <span>Lihat Detail</span>
          <ArrowRight className="w-3.5 h-3.5 text-red-500 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
