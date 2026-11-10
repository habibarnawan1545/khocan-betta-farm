'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tag, Maximize2, X } from 'lucide-react';
import { FishItem } from '@/lib/db/types';
import { formatIDR } from '@/lib/utils';

interface FishDetailCardProps {
  item: FishItem;
  index: number;
}

export function FishDetailCard({ item, index }: FishDetailCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const PLACEHOLDER = 'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80';
  const fishPhoto = item.fish_photo?.trim() || PLACEHOLDER;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch rounded-xl overflow-hidden bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 shadow-md">
        {/* Fish Photo with Zoom Trigger */}
        <div
          onClick={() => setIsZoomed(true)}
          className="relative w-full sm:w-56 md:w-64 aspect-square shrink-0 bg-zinc-950 overflow-hidden cursor-pointer group"
          title="Klik untuk memperbesar foto"
        >
          <Image
            src={fishPhoto}
            alt={item.fish_name}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="p-2 rounded-full bg-zinc-900/80 text-white text-xs flex items-center gap-1.5 border border-zinc-700 backdrop-blur-sm">
              <Maximize2 className="w-3.5 h-3.5" />
              Perbesar
            </span>
          </div>
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-300 border border-zinc-800 backdrop-blur-sm">
              Ikan #{index + 1}
            </span>
          </div>
        </div>

        {/* Fish Info & Price */}
        <div className="p-4 sm:p-6 flex flex-col justify-between flex-1 gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {item.fish_code ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/70 text-red-400 border border-red-800/40">
                  <Tag className="w-3 h-3" />
                  KODE: {item.fish_code}
                </span>
              ) : (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  NO CODE
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              {item.fish_name}
            </h3>

            {item.notes && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/50">
                &ldquo;{item.notes}&rdquo;
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Harga Kemenangan
              </span>
              <span className="text-xl sm:text-2xl font-black text-red-500 tracking-tight font-mono">
                {formatIDR(item.winning_price)}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              *Hasil final TikTok Live
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 p-2 rounded-full bg-zinc-900 border border-zinc-700 transition-colors"
              aria-label="Tutup foto"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full aspect-square max-h-[80vh] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <Image
                src={fishPhoto}
                alt={item.fish_name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-white font-bold text-base">{item.fish_name}</p>
              <p className="text-zinc-400 text-xs font-mono">{item.fish_code || 'Khocan Betta Farm'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
