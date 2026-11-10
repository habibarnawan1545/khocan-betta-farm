-- ==============================================================================
-- KHOCAN BETTA FARM - DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Sistem Informasi Hasil Lelang Ikan Cupang
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('unpaid', 'partial', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLE: auction_sessions
-- Holds auction event periods (Senin-Selasa, Kamis-Jumat, Sabtu-Minggu, etc.)
CREATE TABLE IF NOT EXISTS public.auction_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    shipping_date DATE NOT NULL,
    status session_status NOT NULL DEFAULT 'closed',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index to enforce ONLY ONE 'active' session at any given time
CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_active_session 
ON public.auction_sessions (status) 
WHERE status = 'active';

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_auction_sessions_status ON public.auction_sessions(status);
CREATE INDEX IF NOT EXISTS idx_auction_sessions_created_at ON public.auction_sessions(created_at DESC);

-- 4. TABLE: winners
-- Holds winner identities grouped under a session
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.auction_sessions(id) ON DELETE CASCADE,
    winner_name TEXT NOT NULL,
    slug TEXT NOT NULL,
    phone_number TEXT,
    shipping_address TEXT,
    shipping_status TEXT NOT NULL DEFAULT 'ready',
    courier TEXT,
    tracking_number TEXT,
    payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
    payment_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_session_winner_slug UNIQUE (session_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_winners_session_id ON public.winners(session_id);
CREATE INDEX IF NOT EXISTS idx_winners_slug ON public.winners(slug);
CREATE INDEX IF NOT EXISTS idx_winners_payment_status ON public.winners(payment_status);

-- 5. TABLE: fish_items
-- Holds individual betta fish won by a winner
CREATE TABLE IF NOT EXISTS public.fish_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_id UUID NOT NULL REFERENCES public.winners(id) ON DELETE CASCADE,
    fish_name TEXT NOT NULL,
    fish_code TEXT,
    fish_photo TEXT NOT NULL,
    winning_price BIGINT NOT NULL CHECK (winning_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fish_items_winner_id ON public.fish_items(winner_id);
CREATE INDEX IF NOT EXISTS idx_fish_items_fish_code ON public.fish_items(fish_code);

-- 6. TABLE: admin_profiles
-- Maps Supabase Auth users to Admin privileges (strictly two admin accounts)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SECURE PUBLIC VIEWS
-- PUBLIC VIEW: Never exposes payment_status or payment_note to visitors
CREATE OR REPLACE VIEW public.public_winners AS
SELECT 
    w.id,
    w.session_id,
    w.winner_name,
    w.slug,
    w.created_at,
    COUNT(f.id)::int AS fish_count,
    COALESCE(SUM(f.winning_price), 0)::bigint AS total_winning_price,
    (
        SELECT f2.fish_photo 
        FROM public.fish_items f2 
        WHERE f2.winner_id = w.id 
        ORDER BY f2.created_at ASC 
        LIMIT 1
    ) AS representative_photo
FROM public.winners w
LEFT JOIN public.fish_items f ON f.winner_id = w.id
JOIN public.auction_sessions s ON s.id = w.session_id
WHERE s.status = 'active'
GROUP BY w.id, w.session_id, w.winner_name, w.slug, w.created_at;

-- 8. HELPER FUNCTION: Check if caller is authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.admin_profiles 
        WHERE user_id = auth.uid()
    );
$$;

-- 9. TRIGGER: Set only one active session automatically on activate
CREATE OR REPLACE FUNCTION public.handle_activate_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        -- Close all other active sessions so only one remains active
        UPDATE public.auction_sessions
        SET status = 'closed', updated_at = timezone('utc'::text, now())
        WHERE id <> NEW.id AND status = 'active';
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activate_session ON public.auction_sessions;
CREATE TRIGGER trg_activate_session
BEFORE INSERT OR UPDATE OF status ON public.auction_sessions
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION public.handle_activate_session();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.auction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for auction_sessions
-- Public can read active sessions
CREATE POLICY "Public can view active sessions"
ON public.auction_sessions FOR SELECT
USING (status = 'active');

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.auction_sessions FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admins can insert/update/delete sessions
CREATE POLICY "Admins can manage sessions"
ON public.auction_sessions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy for winners
-- Public can read winners from active session (payment info protected via view/API)
CREATE POLICY "Public can view winners of active session"
ON public.winners FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.auction_sessions s 
        WHERE s.id = winners.session_id AND s.status = 'active'
    )
);

-- Admins can manage all winners
CREATE POLICY "Admins can manage winners"
ON public.winners FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy for fish_items
-- Public can view fish of active session winners
CREATE POLICY "Public can view fish items of active session winners"
ON public.fish_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.winners w
        JOIN public.auction_sessions s ON s.id = w.session_id
        WHERE w.id = fish_items.winner_id AND s.status = 'active'
    )
);

-- Admins can manage all fish items
CREATE POLICY "Admins can manage fish items"
ON public.fish_items FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy for admin_profiles
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles FOR SELECT
TO authenticated
USING (public.is_admin());
