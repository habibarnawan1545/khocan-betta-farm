import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { SessionBanner } from '@/components/public/SessionBanner';
import { WinnerGrid } from '@/components/public/WinnerGrid';
import { getActiveSession, getPublicWinners } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const session = await getActiveSession();
  const winners = session ? await getPublicWinners(session.id) : [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        <SessionBanner session={session} winnerCount={winners.length} />

        {session && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                  DAFTAR PEMENANG LELANG
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Klik kartu nama kamu untuk melihat rincian seluruh ikan yang kamu menangkan.
                </p>
              </div>
            </div>

            <WinnerGrid winners={winners} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
