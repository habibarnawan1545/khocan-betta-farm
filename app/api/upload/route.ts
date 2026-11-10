import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Max 10MB input (sebelum dikompres)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Pengaturan kompresi
const COMPRESS_MAX_WIDTH = 1200;   // px — cukup untuk web
const COMPRESS_MAX_HEIGHT = 1200;  // px
const WEBP_QUALITY = 72;           // 0–100, makin rendah makin kecil

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(COMPRESS_MAX_WIDTH, COMPRESS_MAX_HEIGHT, {
      fit: 'inside',            // jaga aspek rasio, tidak crop
      withoutEnlargement: true, // jangan perbesar gambar kecil
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file gambar yang dikirim.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak valid. Gunakan JPEG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas maksimal (10MB).' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // Kompres & konversi ke format WebP hemat ukuran
    const compressedBuffer = await compressImage(originalBuffer);

    const originalKB = Math.round(originalBuffer.length / 1024);
    const compressedKB = Math.round(compressedBuffer.length / 1024);

    // Nama file unik
    const cleanBase = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40) || 'ikan';
    const uniqueFileName = `${Date.now()}-${cleanBase}.webp`;

    // Simpan langsung ke folder public/uploads/fish di server / laptop
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fish');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.promises.writeFile(filePath, compressedBuffer);

    const publicUrl = `/uploads/fish/${uniqueFileName}`;

    return NextResponse.json({
      url: publicUrl,
      storage: 'local',
      originalSize: originalKB,
      compressedSize: compressedKB,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengunggah foto.' }, { status: 500 });
  }
}
