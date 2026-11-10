import { NextRequest, NextResponse } from 'next/server';
import { getAdminWinners, createWinner } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id') || undefined;

    const winners = await getAdminWinners(sessionId);
    return NextResponse.json({ winners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      winner_name,
      recipient_name,
      phone_number,
      shipping_address,
      shipping_status,
      courier,
      tracking_number,
      payment_status,
      payment_note,
    } = body;

    if (!session_id || !winner_name) {
      return NextResponse.json(
        { error: 'ID sesi dan nama pemenang wajib diisi.' },
        { status: 400 }
      );
    }

    const winner = await createWinner({
      session_id,
      winner_name,
      recipient_name,
      phone_number,
      shipping_address,
      shipping_status,
      courier,
      tracking_number,
      payment_status,
      payment_note,
    });

    return NextResponse.json({ winner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
