import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Daftar password yang diizinkan (menerima adminkhocan maupun KhocanBetta2026!)
const ALLOWED_PASSWORDS = [
  'adminkhocan',
  'KhocanBetta2026!',
  process.env.ADMIN_PASSWORD_1,
  process.env.ADMIN_PASSWORD_2,
].filter(Boolean);

const ALLOWED_USERNAMES = [
  'admin',
  'owner',
  'admin@khocanbettafarm.online',
  'admin@khocanbettafarm.com',
  (process.env.ADMIN_USER_1 || '').toLowerCase().trim(),
  (process.env.ADMIN_USER_2 || '').toLowerCase().trim(),
].filter(Boolean);

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

    const isUsernameValid = ALLOWED_USERNAMES.includes(inputIdentifier);
    const isPasswordValid = ALLOWED_PASSWORDS.includes(password);

    if (isUsernameValid && isPasswordValid) {
      const cookieStore = await cookies();
      cookieStore.set(
        'khocan_admin_session',
        JSON.stringify({
          id: `admin-${inputIdentifier}`,
          email: inputIdentifier,
          displayName: 'Admin - Khocan Betta Farm',
          role: 'admin',
        }),
        {
          httpOnly: true,
          secure: isHttps,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 hari
        }
      );

      return NextResponse.json({
        user: {
          id: `admin-${inputIdentifier}`,
          username: inputIdentifier,
          displayName: 'Admin - Khocan Betta Farm',
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
