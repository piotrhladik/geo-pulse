-- ═══════════════════════════════════════════════════════════════════════
-- GEO Pulse AI — Supabase Database Schema (Darmowy Tier)
-- 
-- INSTRUKCJA:
-- 1. Otwórz projekt w Supabase Dashboard
-- 2. Idź do SQL Editor
-- 3. Wklej cały ten plik
-- 4. Kliknij "Run"
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Users Table ──────────────────────────────────────────────────────
-- Przechowuje dane użytkowników i status płatności
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL UNIQUE,
  name VARCHAR(255),
  plan VARCHAR(32) NOT NULL DEFAULT 'free',
  is_pro BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_current_period_end TIMESTAMPTZ,
  credits INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Audits Table ─────────────────────────────────────────────────────
-- Przechowuje wyniki audytów GEO
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  brand_name VARCHAR(255),
  geo_score INTEGER,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  gaps JSONB,
  recommendations JSONB,
  json_ld_schema JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Payments Table (opcjonalne - do śledzenia płatności) ────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  product VARCHAR(64),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes (przyspieszają zapytania) ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_site_url ON audits(site_url);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(stripe_session_id);

-- ─── Row Level Security (RLS) ────────────────────────────────────────
-- Włącz RLS na tabelach
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Polityki dla users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Polityki dla audits - pozwól na anonimowe audyty (bez logowania)
CREATE POLICY "Allow anonymous audit inserts"
  ON audits FOR INSERT
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anonymous audit reads"
  ON audits FOR SELECT
  USING (user_id IS NULL);

CREATE POLICY "Users can view own audits"
  ON audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own audits"
  ON audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Polityki dla payments - tylko odczyt dla właściciela
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Service Role Bypass (dla webhooków) ─────────────────────────────
-- Webhooks używają service role key, który omija RLS
-- Upewnij się, że używasz SUPABASE_SERVICE_ROLE_KEY w webhookach

-- ─── Trigger: auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audits_updated_at ON audits;
CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Przykładowe dane (opcjonalne - do testów) ────────────────────────
-- INSERT INTO users (email, name, plan, is_pro, credits) 
-- VALUES ('test@example.com', 'Test User', 'pro', true, 999999);

-- ═══════════════════════════════════════════════════════════════════════
-- GOTOWE! Twoja baza danych jest skonfigurowana.
-- 
-- Następny krok: Skopiuj connection string z Settings → Database
-- i wklej go jako DATABASE_URL w Vercel.
-- ═══════════════════════════════════════════════════════════════════════
