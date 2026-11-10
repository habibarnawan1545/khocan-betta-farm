import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, createSession } from '@/lib/db/repository';

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_name, start_date, end_date, shipping_date, status, notes } = body;

    if (!session_name || !start_date || !end_date || !shipping_date) {
      return NextResponse.json(
        { error: 'Nama sesi, tanggal mulai, tanggal selesai, dan tanggal pengiriman wajib diisi.' },
        { status: 400 }
      );
    }

    const session = await createSession({
      session_name,
      start_date,
      end_date,
      shipping_date,
      status: status || 'closed',
      notes,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
