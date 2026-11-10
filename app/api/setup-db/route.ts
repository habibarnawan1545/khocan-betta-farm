import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS auction_sessions (
    id VARCHAR(36) PRIMARY KEY,
    session_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    shipping_date DATE NOT NULL,
    status ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'closed',
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    winner_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NULL,
    shipping_address TEXT NULL,
    shipping_status VARCHAR(50) NOT NULL DEFAULT 'ready',
    courier VARCHAR(100) NULL,
    tracking_number VARCHAR(100) NULL,
    payment_status ENUM('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid',
    payment_note TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_winners_session FOREIGN KEY (session_id) REFERENCES auction_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_session_winner_slug (session_id, slug),
    INDEX idx_session_id (session_id),
    INDEX idx_slug (slug),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fish_items (
    id VARCHAR(36) PRIMARY KEY,
    winner_id VARCHAR(36) NOT NULL,
    fish_name VARCHAR(255) NOT NULL,
    fish_code VARCHAR(100) NULL,
    fish_photo TEXT NOT NULL,
    winning_price BIGINT NOT NULL DEFAULT 0,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fish_winner FOREIGN KEY (winner_id) REFERENCES winners(id) ON DELETE CASCADE,
    INDEX idx_winner_id (winner_id),
    INDEX idx_fish_code (fish_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const SEED_SQL = `
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

INSERT IGNORE INTO winners (id, session_id, winner_name, slug, phone_number, payment_status, payment_note)
VALUES
    ('w001-1111-2222-3333-444444444001', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'IDRIS YU', 'idris-yu', '081234567890', 'paid', 'Transfer BCA lunas + ongkir YES'),
    ('w002-1111-2222-3333-444444444002', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'BUDI BETTA', 'budi-betta', '081398765432', 'partial', 'DP Rp 100.000 via Mandiri, pelunasan malam ini'),
    ('w003-1111-2222-3333-444444444003', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'ANDI CUPANG', 'andi-cupang', '082155443322', 'unpaid', 'Belum konfirmasi via WhatsApp'),
    ('w004-1111-2222-3333-444444444004', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'HENDRA WIJAYA', 'hendra-wijaya', '085611223344', 'paid', 'Lunas transfer Seabank'),
    ('w005-1111-2222-3333-444444444005', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'REZA BETTA ADDICT', 'reza-betta-addict', '087799887766', 'paid', 'Lunas QRIS'),
    ('w006-1111-2222-3333-444444444006', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'DIMAS AQUATIC', 'dimas-aquatic', '081900112233', 'unpaid', 'Menunggu respon WA');

INSERT IGNORE INTO fish_items (id, winner_id, fish_name, fish_code, fish_photo, winning_price, notes)
VALUES
    ('f001-0000-0000-0000-000000000001', 'w001-1111-2222-3333-444444444001', 'Blue Rim Male Grade A', 'BR-01', 'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80', 150000, 'Form rapi, clean body, ring rapi'),
    ('f002-0000-0000-0000-000000000002', 'w001-1111-2222-3333-444444444001', 'Nemo Galaxy Multi Color', 'NG-04', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80', 200000, 'Full star, dorsal tegak'),
    ('f003-0000-0000-0000-000000000003', 'w001-1111-2222-3333-444444444001', 'Fancy Copper Plakat', 'FC-12', 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80', 175000, 'Metallic shine pekat'),
    ('f004-0000-0000-0000-000000000004', 'w002-1111-2222-3333-444444444002', 'Black Samurai Male Super Cross', 'BS-08', 'https://images.unsplash.com/photo-1520315341629-689b108e4d52?auto=format&fit=crop&w=800&q=80', 220000, 'Helmet full sisik naga'),
    ('f005-0000-0000-0000-000000000005', 'w002-1111-2222-3333-444444444002', 'Super Red HMPK Extreme', 'SR-03', 'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80', 180000, 'Warna merah cabai pekat no bocor'),
    ('f006-0000-0000-0000-000000000006', 'w003-1111-2222-3333-444444444003', 'Avatar Gordon Male High Quality', 'AV-02', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80', 300000, 'Bintik biru menyala pekat'),
    ('f007-0000-0000-0000-000000000007', 'w003-1111-2222-3333-444444444003', 'Yellow Base Fancy Tiger', 'FT-15', 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80', 160000, 'Yellow base motif macan clean'),
    ('f008-0000-0000-0000-000000000008', 'w003-1111-2222-3333-444444444003', 'Hellboy Male Line Thailand', 'HB-05', 'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80', 190000, 'Mental predator, ekor C spread 180'),
    ('f009-0000-0000-0000-000000000009', 'w003-1111-2222-3333-444444444003', 'Multi Color Galaxy Candy', 'CD-09', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80', 175000, 'Kombinasi warna cerah'),
    ('f010-0000-0000-0000-000000000010', 'w003-1111-2222-3333-444444444003', 'White Platinum Male Snow', 'WP-01', 'https://images.unsplash.com/photo-1520315341629-689b108e4d52?auto=format&fit=crop&w=800&q=80', 140000, 'Sisik solid putih bersalju'),
    ('f011-0000-0000-0000-000000000011', 'w004-1111-2222-3333-444444444004', 'Avatar Dark Blue King Size', 'AV-09', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80', 260000, 'Size L, bukaan ekor mantap'),
    ('f012-0000-0000-0000-000000000012', 'w005-1111-2222-3333-444444444005', 'Blue Rim Female Ready Breed', 'BR-F03', 'https://images.unsplash.com/photo-1544943910-4c1dc44a0eb5?auto=format&fit=crop&w=800&q=80', 160000, 'Female siap breed full telur'),
    ('f013-0000-0000-0000-000000000013', 'w005-1111-2222-3333-444444444005', 'Nemo Tiger Male', 'NT-07', 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80', 210000, 'Warna pedas kontras'),
    ('f014-0000-0000-0000-000000000014', 'w006-1111-2222-3333-444444444006', 'Copper Gold Plakat Show', 'CG-02', 'https://images.unsplash.com/photo-1520315341629-689b108e4d52?auto=format&fit=crop&w=800&q=80', 240000, 'Kilau emas memikat');
`;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('key');
  if (secret !== 'khocan2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'u404886323_admin';
  const password = process.env.MYSQL_PASSWORD || 'Sandi1203';
  const database = process.env.MYSQL_DATABASE || 'u404886323_khocan';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  try {
    const conn = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      multipleStatements: true,
    });

    // Execute schema
    await conn.query(SCHEMA_SQL);

    // Execute seed
    await conn.query(SEED_SQL);

    await conn.end();

    return NextResponse.json({
      success: true,
      message: 'Database tables and sample data created successfully on Hostinger MySQL!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

