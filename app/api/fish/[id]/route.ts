import { NextRequest, NextResponse } from 'next/server';
import { updateFishItem, deleteFishItem } from '@/lib/db/repository';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const fishItem = await updateFishItem(id, body);
    if (!fishItem) {
      return NextResponse.json({ error: 'Data ikan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ fishItem });
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
    const success = await deleteFishItem(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
