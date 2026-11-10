import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Akun Admin Resmi KHOCAN BETTA FARM
const ADMIN_ACCOUNTS = [
  {
    username: (process.env.ADMIN_USER_1 || 'admin').toLowerCase().trim(),
    displayName: 'Admin - Khocan Betta Farm',
    password: process.env.ADMIN_PASSWORD_1 || 'adminkhocan',
  },
  {
    username: (process.env.ADMIN_USER_2 || 'owner').toLowerCase().trim(),
    displayName: 'Owner - Khocan Betta Farm',
    password: process.env.ADMIN_PASSWORD_2 || 'adminkhocan',
  },
  // Kompatibilitas jika login via email lama
  {
    username: 'admin@khocanbettafarm.online',
    displayName: 'Admin - Khocan Betta Farm',
    password: 'adminkhocan',
  },
  {
    username: 'admin@khocanbettafarm.com',
    displayName: 'Admin - Khocan Betta Farm',
    password: 'adminkhocan',
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputIdentifier = (body.username || body.email || '').toLowerCase().trim();
    const password = body.password;

    if (!inputIdentifier || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    // Cek kecocokan username dan password
    const matchedAccount = ADMIN_ACCOUNTS.find(
      (acc) => acc.username === inputIdentifier && acc.password === password
    );

    if (matchedAccount) {
      const cookieStore = await cookies();
      cookieStore.set(
        'khocan_admin_session',
        JSON.stringify({
          id: `admin-${matchedAccount.username}`,
          email: matchedAccount.username,
          displayName: matchedAccount.displayName,
          role: 'admin',
        }),
        {
          httpOnly: true,
          secure: isHttps,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // Berlaku 7 hari
        }
      );

      return NextResponse.json({
        user: {
          id: `admin-${matchedAccount.username}`,
          username: matchedAccount.username,
          displayName: matchedAccount.displayName,
        },
      });
    }

    return NextResponse.json(
      { error: 'Username atau password salah.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
