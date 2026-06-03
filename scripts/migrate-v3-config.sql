-- ─── Migración v3: Configuración global de plataforma ───────────────
-- Ejecutar en Neon SQL Editor

CREATE TABLE IF NOT EXISTS platform_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar config base (ajustar valores según corresponda)
INSERT INTO platform_config (key, value) VALUES
  ('metricool_user_id',    '1010863'),
  ('metricool_user_token', ''),
  ('default_brand_id',     '1674000'),
  ('default_brand_name',   'Simet Fábrica')
ON CONFLICT (key) DO NOTHING;
