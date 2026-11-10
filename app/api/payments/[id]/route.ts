import { NextRequest, NextResponse } from 'next/server';
import { updateWinner } from '@/lib/db/repository';
import { PaymentStatus } from '@/lib/db/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { payment_status, payment_note } = body;

    const validStatuses: PaymentStatus[] = ['unpaid', 'partial', 'paid'];
    if (payment_status && !validStatuses.includes(payment_status)) {
      return NextResponse.json(
        { error: 'Status pembayaran harus berupa: unpaid (Belum Bayar), partial (Sebagian), atau paid (Lunas).' },
        { status: 400 }
      );
    }

    const updated = await updateWinner(id, {
      payment_status,
      payment_note: payment_note !== undefined ? payment_note : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Pemenang tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ winner: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
