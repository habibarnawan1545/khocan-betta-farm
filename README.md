# KHOCAN BETTA FARM 🐟
### Sistem Informasi & Katalog Digital Hasil Lelang Ikan Cupang (TikTok Live)

Website resmi **KHOCAN BETTA FARM** dirancang khusus untuk mendokumentasikan dan mempublikasikan hasil lelang ikan cupang hias yang dilakukan melalui live streaming TikTok.

> **Catatan Konsep Bisnis:** Website ini **BUKAN** platform bidding online. Seluruh penawaran lelang dilakukan secara langsung (live) di TikTok Live KHOCAN BETTA FARM. Website ini berfungsi sebagai katalog hasil lelang resmi, rekapitulasi data pemenang, dan rincian seluruh ikan yang dimenangkan.

---

## 🌟 Fitur Utama

### 1. Website Publik (Untuk Pengunjung & Peserta Lelang)
- **Halaman Beranda (`/`)**:
  - Banner identitas brand KHOCAN BETTA FARM & badge TikTok Live.
  - Informasi Sesi Lelang Aktif & Jadwal Pengiriman paket ikan.
  - Fitur pencarian cepat (*instant live search*) nama pemenang.
  - Tampilan grid responsif marketplace:
    - **Desktop**: Hingga 6 kartu dalam satu baris (`xl:grid-cols-6 lg:grid-cols-5`).
    - **Tablet**: 3–4 kartu dalam satu baris (`md:grid-cols-4 sm:grid-cols-3`).
    - **Smartphone**: 2 kartu dalam satu baris (`grid-cols-2`).
  - Foto ikan representatif dengan rasio konsisten (`aspect-square`), nama pemenang, jumlah ikan, dan tombol *Lihat Detail*.
- **Halaman Detail Kemenangan (`/pemenang/[slug]`)**:
  - URL tersendiri yang unik dan bersih (contoh: `/pemenang/idris-yu`).
  - **Bukan popup/modal**, melainkan halaman penuh yang mudah disimpan dan dibagikan.
  - Menampilkan nama pemenang, sesi lelang, tanggal pengiriman, dan jumlah total ikan.
  - Daftar seluruh ikan yang dimenangkan: foto beresolusi tinggi (dengan fitur zoom/lightbox), nama/jenis ikan, kode ikan (opsional), dan harga kemenangan masing-masing.
  - **Perhitungan Otomatis**: Total kemenangan dihitung otomatis dari seluruh ikan pemenang tersebut.
  - **Keamanan Privasi (Zero Leak)**: Informasi status pembayaran (`payment_status` dan `payment_note`) **TIDAK PERNAH** ditampilkan pada halaman publik atau API publik.

### 2. Dashboard Admin (`/admin`)
- **Autentikasi Aman**: Dibatasi untuk 2 akun admin resmi terdaftar via Supabase Auth / Session cookie.
- **Ringkasan Metrik Dashboard (`/admin`)**:
  - Total sesi lelang yang tercatat.
  - Total pemenang.
  - Total ikan terjual.
  - Total nilai kemenangan lelang (omzet IDR).
  - Spotlight status sesi aktif saat ini & jadwal pengiriman.
  - Ringkasan status pembayaran (Lunas, DP Sebagian, Belum Bayar).
- **Kelola Sesi Lelang (`/admin/sesi`)**:
  - Membuat sesi baru dengan preset otomatis 3 pola jadwal resmi:
    1. Lelang **Senin–Selasa**, Pengiriman **Rabu**.
    2. Lelang **Kamis–Jumat**, Pengiriman **Sabtu**.
    3. Lelang **Sabtu–Minggu**, Pengiriman **Senin**.
  - **Aturan Sesi**: Hanya 1 sesi yang boleh berstatus `active` untuk tampil ke publik.
  - Kemudahan mengaktifkan, menutup, mengarsipkan, dan mengedit sesi lelang.
  - Seluruh arsip sesi lama tetap tersimpan di database dan tidak pernah terhapus saat sesi baru diaktifkan.
- **Data Pemenang (`/admin/pemenang`)**:
  - Input nama pemenang per sesi (otomatis slugify dan kapital).
  - Setiap pemenang hanya perlu dibuat satu kali per sesi.
  - Menghubungkan langsung ke nomor WhatsApp pemenang.
- **Data Ikan & Foto (`/admin/ikan`)**:
  - Input jenis ikan, kode ikan, dan harga kemenangan.
  - Unggah foto dari komputer atau smartphone.
  - Integrasi penyimpanan foto via **Cloudflare R2** (S3 compatible) atau fallback lokal `/public/uploads/`.
- **Pengelolaan Pembayaran (`/admin/pembayaran`)**:
  - Khusus internal admin.
  - 3 status resmi: **Belum Bayar**, **Pembayaran Sebagian (DP)**, dan **Lunas**.
  - Catatan transaksi pembayaran (bank transfer, ekspedisi, dll).
  - Filter cepat dan toggle status instan.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend & Backend**: [Next.js](https://nextjs.org/) (App Router, Server Components, Route Handlers), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/).
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL Database, Supabase Auth, Row Level Security / RLS).
- **Penyimpanan Foto**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3 compatible API via `@aws-sdk/client-s3`).
- **Deployment**: [Vercel](https://vercel.com/) ready.

---

## 🗄️ Struktur Database (PostgreSQL / Supabase)

Skema database lengkap tersedia pada file [`supabase/schema.sql`](supabase/schema.sql) dan data awal pada [`supabase/seed.sql`](supabase/seed.sql):

1. `auction_sessions`: Menyimpan periode lelang, tanggal mulai, selesai, tanggal pengiriman, dan status (`active`, `closed`, `archived`). Terdapat trigger dan constraint yang memastikan hanya 1 sesi aktif.
2. `winners`: Menyimpan data pemenang (`winner_name`, `slug`, `payment_status`, `payment_note`, FK `session_id`).
3. `fish_items`: Menyimpan ikan yang dimenangkan (`fish_name`, `fish_code`, `fish_photo`, `winning_price`, FK `winner_id`).
4. `admin_profiles`: Memetakan ID user Supabase Auth ke akun admin terotorisasi.
5. `public_winners`: View aman untuk publik yang tidak mengekspos kolom pembayaran.

---

## 🚀 Panduan Menjalankan Project

### 1. Prasyarat
- Node.js LTS (v20 atau lebih baru).
- npm atau pnpm.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi konfigurasi Supabase dan Cloudflare R2 jika sudah siap:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_role_key=your_service_role_key

R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=khocan-betta-images
R2_PUBLIC_DOMAIN=https://images.khocanbettafarm.com
```
*(Catatan: Aplikasi memiliki fallback lokal mandiri jika kredensial belum diisi, sehingga dapat langsung diuji dan dijalankan secara instan).*

### 4. Menjalankan Mode Pengembangan
```bash
npm run dev
```
Buka browser pada `http://localhost:3000`.

### 5. Membangun untuk Produksi
```bash
npm run build
npm run start
```

---

## 🔐 Akun Akses Admin

Dua akun admin resmi terdaftar pada sistem:

| Akun Admin | Email | Password Bawaan |
| :--- | :--- | :--- |
| **Admin 1 (Operasional)** | `admin@khocanbettafarm.com` | `KhocanBetta2026!` |
| **Admin 2 (Owner Khocan)** | `owner@khocanbettafarm.com` | `KhocanBetta2026!` |

Akses dashboard melalui: `http://localhost:3000/admin/login`.

---

## 🎨 Identitas Visual Brand
- **Warna Utama**: Deep Charcoal & Jet Black (`#09090b`, `#121217`).
- **Warna Aksen**: Vibrant Betta Crimson Red (`#e11d48`, `#ef4444`).
- **Karakter**: Minimalis, premium, maskulin, cepat, berorientasi foto cupang kualitas kontes.
