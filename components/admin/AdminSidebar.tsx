'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Fish,
  CreditCard,
  Truck,
  LogOut,
  Flame,
  ExternalLink,
} from 'lucide-react';

export function AdminSidebar() {
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

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Sesi', href: '/admin/sesi', icon: CalendarDays },
    { label: 'Data Pemenang', href: '/admin/pemenang', icon: Users },
    { label: 'Data Ikan', href: '/admin/ikan', icon: Fish },
    { label: 'Pembayaran', href: '/admin/pembayaran', icon: CreditCard },
    { label: 'Siap Dikirim', href: '/admin/pengiriman', icon: Truck },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-zinc-950 border-r border-zinc-800/80 flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-zinc-800/80">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/40">
              <Flame className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-white block">
                KHOCAN <span className="text-red-500">BETTA</span>
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest block">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Link to public website & Logout */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-zinc-500" />
            Website Publik
          </span>
          <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">Live</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
