-- ==============================================================================
-- KHOCAN BETTA FARM - MYSQL DATABASE SCHEMA
-- Untuk Hostinger (hPanel / MariaDB / MySQL) & DBeaver
-- ==============================================================================

-- 1. Buat Tabel: auction_sessions (Sesi Lelang)
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

-- 2. Buat Tabel: winners (Pemenang Lelang)
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

-- 3. Buat Tabel: fish_items (Daftar Ikan yang Dimenangkan)
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

-- 4. Buat Tabel: admin_profiles (Data Akun Admin)
CREATE TABLE IF NOT EXISTS admin_profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

