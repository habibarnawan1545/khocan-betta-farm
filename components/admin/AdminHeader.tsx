'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Radio,
  UserCheck,
  LayoutDashboard,
  CalendarDays,
  Users,
  Fish,
  CreditCard,
  Truck,
  LogOut,
  Flame,
} from 'lucide-react';
import { AuctionSession } from '@/lib/db/types';

interface AdminHeaderProps {
  activeSession: AuctionSession | null;
}

export function AdminHeader({ activeSession }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/admin':
        return 'Ringkasan Dashboard';
      case '/admin/sesi':
        return 'Kelola Sesi Lelang';
      case '/admin/pemenang':
        return 'Kelola Data Pemenang';
      case '/admin/ikan':
        return 'Kelola Data Ikan & Foto';
      case '/admin/pembayaran':
        return 'Pengelolaan Pembayaran Lelang';
      case '/admin/pengiriman':
        return 'Ikan Siap Dikirim';
      default:
        return 'Admin Panel';
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Sesi', href: '/admin/sesi', icon: CalendarDays },
    { label: 'Data Pemenang', href: '/admin/pemenang', icon: Users },
    { label: 'Data Ikan', href: '/admin/ikan', icon: Fish },
    { label: 'Pembayaran', href: '/admin/pembayaran', icon: CreditCard },
    { label: 'Siap Dikirim', href: '/admin/pengiriman', icon: Truck },
  ];

  return (
    <>
      <header className="h-16 sm:h-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black uppercase text-white tracking-wide truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              Sistem Manajemen Katalog Lelang KHOCAN BETTA FARM
            </p>
          </div>
        </div>

        {/* Current Active Session & Admin status */}
        <div className="flex items-center gap-2 shrink-0">
          {activeSession ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400 shrink-0" />
              <span className="hidden lg:inline text-zinc-400">Sesi Aktif:</span>
              <span className="font-bold max-w-[90px] sm:max-w-[200px] truncate text-[11px] sm:text-xs">
                {activeSession.session_name}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] sm:text-xs">
              Tidak Ada Sesi
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Admin</span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
          <div className="w-64 bg-zinc-950 border-r border-zinc-800 h-full p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white">
                    <Flame className="w-4 h-4 fill-white/20" />
                  </div>
                  <span className="text-xs font-bold uppercase text-white">KHOCAN BETTA</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                        isActive ? 'bg-red-600 text-white shadow-md shadow-red-950/40' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="block text-center py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              >
                Buka Website Publik ↗
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
