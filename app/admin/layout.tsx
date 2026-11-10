import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getActiveSession } from '@/lib/db/repository';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('khocan_admin_session');

  // If not logged in, allow login page, redirect others
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Note: /admin/login handles its own layout via check or condition
  // In Next.js App Router, if this layout wraps /admin/login, we should check if path is login or render cleanly.
  // To keep /admin/login clean without sidebar:
  return (
    <AdminLayoutWrapper isAuthenticated={isAuthenticated}>
      {children}
    </AdminLayoutWrapper>
  );
}

async function AdminLayoutWrapper({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  const activeSession = await getActiveSession();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {isAuthenticated && <AdminSidebar />}

      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {isAuthenticated && <AdminHeader activeSession={activeSession} />}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
