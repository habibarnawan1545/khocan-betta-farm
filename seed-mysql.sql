-- ==============================================================================
-- KHOCAN BETTA FARM - INITIAL SEED DATA (MYSQL)
-- ==============================================================================

-- 1. Create Sample Sessions
INSERT IGNORE INTO auction_sessions (id, session_name, start_date, end_date, shipping_date, status, notes)
VALUES 
    (
        'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'LELANG SENIN–SELASA, 03–04 NOVEMBER 2026',
        '2026-11-03',
        '2026-11-04',
        '2026-11-05',
        'archived',
        'Sesi lelang awal bulan November'
    ),
    (
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'LELANG KAMIS–JUMAT, 05–06 NOVEMBER 2026',
        '2026-11-05',
        '2026-11-06',
        '2026-11-07',
        'active',
        'Sesi lelang live TikTok resmi Khocan Betta Farm (Pengiriman Sabtu)'
    );

-- 2. Insert Winners for Active Session
INSERT IGNORE INTO winners (id, session_id, winner_name, slug, phone_number, payment_status, payment_note)
VALUES
    (
        'w001-1111-2222-3333-444444444001',
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'IDRIS YU',
        'idris-yu',
        '081234567890',
        'paid',
        'Transfer BCA lunas + ongkir YES'
    ),
    (
        'w002-1111-2222-3333-444444444002',
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'BUDI BETTA',
        'budi-betta',
        '081398765432',
        'partial',
        'DP Rp 100.000 via Mandiri, pelunasan malam ini'
    ),
    (
        'w003-1111-2222-3333-444444444003',
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'ANDI CUPANG',
        'andi-cupang',
        '082155443322',
        'unpaid',
        'Belum konfirmasi via WhatsApp'
    ),
    (
        'w004-1111-2222-3333-444444444004',
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'HENDRA WIJAYA',
        'hendra-wijaya',
        '085611223344',
        'paid',
        'Lunas transfer Seabank'
    ),
    (
        'w005-1111-2222-3333-444444444005',
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'REZA BETTA ADDICT',
        'reza-betta-addict',
        '087799887766',
        'paid',
        'Lunas QRIS'
    ),
    (
        'w006-1111-2222-3333-444444444006',
        'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
        'DIMAS AQUATIC',
        'dimas-aquatic',
        '081900112233',
        'unpaid',
        'Menunggu respon WA'
    );

-- 3. Insert Fish Items for the Winners
INSERT IGNORE INTO fish_items (id, winner_id, fish_name, fish_code, fish_photo, winning_price, notes)
VALUES
    (
        'f001-0000-0000-0000-000000000001',
        'w001-1111-2222-3333-444444444001',
        'Blue Rim Male Grade A',
        'BR-01',
        'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80',
        150000,
        'Form rapi, clean body, ring rapi'
    ),
    (
        'f002-0000-0000-0000-000000000002',
        'w001-1111-2222-3333-444444444001',
        'Nemo Galaxy Multi Color',
        'NG-04',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
        200000,
        'Full star, dorsal tegak'
    ),
    (
        'f003-0000-0000-0000-000000000003',
        'w001-1111-2222-3333-444444444001',
        'Fancy Copper Plakat',
        'FC-12',
        'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80',
        175000,
        'Metallic shine pekat'
    ),
    (
        'f004-0000-0000-0000-000000000004',
        'w002-1111-2222-3333-444444444002',
        'Black Samurai Male Super Cross',
        'BS-08',
        'https://images.unsplash.com/photo-1520315341629-689b108e4d52?auto=format&fit=crop&w=800&q=80',
        220000,
        'Helmet full sisik naga'
    ),
    (
        'f005-0000-0000-0000-000000000005',
        'w002-1111-2222-3333-444444444002',
        'Super Red HMPK Extreme',
        'SR-03',
        'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80',
        180000,
        'Warna merah cabai pekat no bocor'
    ),
    (
        'f006-0000-0000-0000-000000000006',
        'w003-1111-2222-3333-444444444003',
        'Avatar Gordon Male High Quality',
        'AV-02',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
        300000,
        'Bintik biru menyala pekat'
    ),
    (
        'f007-0000-0000-0000-000000000007',
        'w003-1111-2222-3333-444444444003',
        'Yellow Base Fancy Tiger',
        'FT-15',
        'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80',
        160000,
        'Yellow base motif macan clean'
    ),
    (
        'f008-0000-0000-0000-000000000008',
        'w003-1111-2222-3333-444444444003',
        'Hellboy Male Line Thailand',
        'HB-05',
        'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80',
        190000,
        'Mental predator, ekor C spread 180'
    ),
    (
        'f009-0000-0000-0000-000000000009',
        'w003-1111-2222-3333-444444444003',
        'Multi Color Galaxy Candy',
        'CD-09',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
        175000,
        'Kombinasi warna cerah'
    ),
    (
        'f010-0000-0000-0000-000000000010',
        'w003-1111-2222-3333-444444444003',
        'White Platinum Male Snow',
        'WP-01',
        'https://images.unsplash.com/photo-1520315341629-689b108e4d52?auto=format&fit=crop&w=800&q=80',
        140000,
        'Sisik solid putih bersalju'
    ),
    (
        'f011-0000-0000-0000-000000000011',
        'w004-1111-2222-3333-444444444004',
        'Avatar Dark Blue King Size',
        'AV-09',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
        260000,
        'Size L, bukaan ekor mantap'
    ),
    (
        'f012-0000-0000-0000-000000000012',
        'w005-1111-2222-3333-444444444005',
        'Blue Rim Female Ready Breed',
        'BR-F03',
        'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80',
        160000,
        'Female siap breed full telur'
    ),
    (
        'f013-0000-0000-0000-000000000013',
        'w005-1111-2222-3333-444444444005',
        'Nemo Tiger Male',
        'NT-07',
        'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80',
        210000,
        'Warna pedas kontras'
    ),
    (
        'f014-0000-0000-0000-000000000014',
        'w006-1111-2222-3333-444444444006',
        'Copper Gold Plakat Show',
        'CG-02',
        'https://images.unsplash.com/photo-1520315341629-689b108e4d52?auto=format&fit=crop&w=800&q=80',
        240000,
        'Kilau emas memikat'
    );

