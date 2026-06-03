-- ─── Migración v2: Vincular videos e ideas con UGC Creators ─────────
-- Ejecutar en Neon SQL Editor

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS ugc_creator_id TEXT REFERENCES ugc_creators(id) ON DELETE SET NULL;

ALTER TABLE content_ideas
  ADD COLUMN IF NOT EXISTS ugc_creator_id TEXT REFERENCES ugc_creators(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_videos_creator     ON videos(ugc_creator_id);
CREATE INDEX IF NOT EXISTS idx_ideas_creator      ON content_ideas(ugc_creator_id);
