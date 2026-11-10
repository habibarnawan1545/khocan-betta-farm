import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-500 mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black uppercase text-white tracking-wide mb-2">
            Halaman Tidak Ditemukan
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            Data pemenang atau halaman yang Anda cari tidak ditemukan pada sistem lelang aktif KHOCAN BETTA FARM.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-950/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda Hasil Lelang
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
