import { NextRequest, NextResponse } from 'next/server';
import { getAllFishItems, getFishByWinnerId, createFishItem } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const winnerId = searchParams.get('winner_id');

    if (winnerId) {
      const fishItems = await getFishByWinnerId(winnerId);
      return NextResponse.json({ fishItems });
    }

    const fishItems = await getAllFishItems();
    return NextResponse.json({ fishItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { winner_id, fish_name, fish_code, fish_photo, winning_price, notes } = body;

    if (!winner_id || !fish_name || !fish_photo || winning_price === undefined) {
      return NextResponse.json(
        { error: 'ID pemenang, nama ikan, foto ikan, dan harga kemenangan wajib diisi.' },
        { status: 400 }
      );
    }

    const fishItem = await createFishItem({
      winner_id,
      fish_name,
      fish_code,
      fish_photo,
      winning_price: Number(winning_price),
      notes,
    });

    return NextResponse.json({ fishItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
