import { NextRequest, NextResponse } from 'next/server';
import { updateWinner, deleteWinner } from '@/lib/db/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const winner = await updateWinner(id, body);
    if (!winner) {
      return NextResponse.json({ error: 'Pemenang tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ winner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteWinner(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
