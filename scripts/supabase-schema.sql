-- SIMET Marketing Hub — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run

-- Tareas Kanban
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  responsible text default '',
  deadline date,
  description text default '',
  priority text check (priority in ('alta', 'media', 'baja')) default 'media',
  status text check (status in ('por_hacer', 'en_proceso', 'revision', 'hecho')) default 'por_hacer',
  brand text default 'Simet Fábrica',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Videos en pauta
create table if not exists videos_pauta (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text default 'instagram',
  format text default 'reels',
  responsible text default '',
  status text check (status in ('pendiente', 'en_produccion', 'publicado')) default 'pendiente',
  en_pauta boolean default false,
  fecha_pauta date,
  post_url text default '',
  notes text default '',
  brand text default 'Simet Fábrica',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- UGC / Influencers
create table if not exists ugc_creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text default '',
  platform text default 'instagram',
  followers integer default 0,
  content_type text default 'reels',
  fee text default '',
  free_product boolean default false,
  publication_date date,
  post_url text default '',
  status text default 'contactado',
  notes text default '',
  brand text default 'Simet Fábrica',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ideas de campañas paid
create table if not exists campaign_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text check (platform in ('meta', 'google', 'ambos')) default 'meta',
  objective text default '',
  description text default '',
  budget text default '',
  start_date date,
  status text check (status in ('idea', 'aprobada', 'en_produccion', 'activa', 'pausada')) default 'idea',
  tags text[] default '{}',
  brand text default 'Simet Fábrica',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ideas de contenido social
create table if not exists social_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text default 'instagram',
  format text default 'reels',
  description text default '',
  hook text default '',
  cta text default '',
  priority text check (priority in ('alta', 'media', 'baja')) default 'media',
  status text check (status in ('pendiente', 'en_proceso', 'descartada')) default 'pendiente',
  tags text[] default '{}',
  brand text default 'Simet Fábrica',
  created_at timestamptz default now()
);

-- Pipeline de videos social (kanban)
create table if not exists video_pipeline (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text default 'instagram',
  format text default 'reels',
  status text check (status in ('idea', 'guion', 'grabacion', 'edicion', 'revision', 'publicado')) default 'idea',
  description text default '',
  publish_date date,
  post_url text default '',
  tags text[] default '{}',
  brand text default 'Simet Fábrica',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Eventos personalizados del calendario
create table if not exists custom_events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  type text check (type in ('nacional', 'mundial', 'comercial', 'sectorial', 'custom')) default 'custom',
  notes text default '',
  brand text default '',
  created_at timestamptz default now()
);

-- Habilitar Row Level Security (seguridad)
alter table tasks enable row level security;
alter table videos_pauta enable row level security;
alter table ugc_creators enable row level security;
alter table campaign_ideas enable row level security;
alter table social_ideas enable row level security;
alter table video_pipeline enable row level security;
alter table custom_events enable row level security;

-- Políticas: permitir todo con anon key (app interna con login propio)
create policy "Allow all" on tasks for all using (true) with check (true);
create policy "Allow all" on videos_pauta for all using (true) with check (true);
create policy "Allow all" on ugc_creators for all using (true) with check (true);
create policy "Allow all" on campaign_ideas for all using (true) with check (true);
create policy "Allow all" on social_ideas for all using (true) with check (true);
create policy "Allow all" on video_pipeline for all using (true) with check (true);
create policy "Allow all" on custom_events for all using (true) with check (true);
