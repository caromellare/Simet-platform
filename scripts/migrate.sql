-- ═══════════════════════════════════════════════════════════════
-- SIMET Marketing Hub — Database Schema
-- Run this in Vercel Postgres → Query editor (or via seed script)
-- ═══════════════════════════════════════════════════════════════

-- ─── Users ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── UGC / Influencers ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ugc_creators (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  handle          TEXT NOT NULL,
  platform        TEXT NOT NULL CHECK (platform IN ('instagram','tiktok','youtube','facebook','twitter','otro')),
  followers       INTEGER NOT NULL DEFAULT 0,
  content_type    TEXT NOT NULL CHECK (content_type IN ('reels','post','story','video','ugc_puro','review','unboxing')),
  fee             TEXT,
  free_product    BOOLEAN NOT NULL DEFAULT FALSE,
  publication_date DATE,
  post_url        TEXT,
  status          TEXT NOT NULL DEFAULT 'contactado'
                    CHECK (status IN ('contactado','negociacion','confirmado','produccion','publicado','cancelado')),
  notes           TEXT NOT NULL DEFAULT '',
  brand           TEXT NOT NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  -- metrics
  metric_views    INTEGER,
  metric_likes    INTEGER,
  metric_comments INTEGER,
  metric_reach    INTEGER,
  metric_saves    INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ugc_brand ON ugc_creators(brand);
CREATE INDEX IF NOT EXISTS idx_ugc_status ON ugc_creators(status);

-- ─── Videos (Social pipeline) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title        TEXT NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('instagram','tiktok','youtube','facebook','twitter','otro')),
  format       TEXT NOT NULL CHECK (format IN ('reels','tiktok','youtube_short','youtube_largo','story','post_video')),
  status       TEXT NOT NULL DEFAULT 'idea'
                 CHECK (status IN ('idea','guion','grabacion','edicion','revision','publicado')),
  description  TEXT,
  script       TEXT,
  publish_date DATE,
  post_url     TEXT,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  brand        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_brand ON videos(brand);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- ─── Content Ideas (Social) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_ideas (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title       TEXT NOT NULL,
  platform    TEXT NOT NULL,
  format      TEXT NOT NULL,
  description TEXT NOT NULL,
  hook        TEXT,
  cta         TEXT,
  priority    TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta','media','baja')),
  brand       TEXT NOT NULL,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (status IN ('pendiente','en_proceso','descartada')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_ideas_brand ON content_ideas(brand);

-- ─── Campaign Ideas (Paid) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_ideas (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title       TEXT NOT NULL,
  platform    TEXT NOT NULL CHECK (platform IN ('meta','google','ambos')),
  objective   TEXT NOT NULL,
  description TEXT NOT NULL,
  budget      TEXT,
  start_date  DATE,
  status      TEXT NOT NULL DEFAULT 'idea'
                CHECK (status IN ('idea','aprobada','en_produccion','activa','pausada')),
  tags        TEXT[] NOT NULL DEFAULT '{}',
  brand       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_ideas_brand ON campaign_ideas(brand);

-- ─── Ephemeris (Calendar) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ephemeris (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date       DATE NOT NULL,
  title      TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('nacional','mundial','comercial','sectorial','custom')),
  notes      TEXT,
  brand      TEXT,
  recurring  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ephemeris_date ON ephemeris(date);
