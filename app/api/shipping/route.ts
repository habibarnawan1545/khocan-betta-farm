import { NextRequest, NextResponse } from 'next/server';
import { getShippingOrders } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id') || undefined;
    const onlyPaidParam = searchParams.get('only_paid');
    const onlyPaid = onlyPaidParam === null ? true : onlyPaidParam === 'true';

    const orders = await getShippingOrders(sessionId, onlyPaid);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

