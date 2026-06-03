import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
export const sql = neon(connectionString)

// ─── Users ───────────────────────────────────────────────────────

export interface DBUser {
  id: string
  name: string
  email: string
  password_hash: string
  role: 'admin' | 'lectura'
  created_at: string
}

export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const rows = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
  return (rows[0] as DBUser) ?? null
}

export async function getUserById(id: string): Promise<DBUser | null> {
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return (rows[0] as DBUser) ?? null
}

export async function getAllUsers(): Promise<Omit<DBUser, 'password_hash'>[]> {
  const rows = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY created_at`
  return rows as Omit<DBUser, 'password_hash'>[]
}

export async function createUser(data: {
  name: string
  email: string
  passwordHash: string
  role?: 'admin' | 'lectura'
}): Promise<DBUser> {
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${data.name}, ${data.email}, ${data.passwordHash}, ${data.role ?? 'lectura'})
    RETURNING *
  `
  return rows[0] as DBUser
}

export async function updateUser(id: string, data: {
  name?: string
  email?: string
  role?: string
  passwordHash?: string
}) {
  if (data.name !== undefined)         await sql`UPDATE users SET name = ${data.name} WHERE id = ${id}`
  if (data.email !== undefined)        await sql`UPDATE users SET email = ${data.email} WHERE id = ${id}`
  if (data.role !== undefined)         await sql`UPDATE users SET role = ${data.role} WHERE id = ${id}`
  if (data.passwordHash !== undefined) await sql`UPDATE users SET password_hash = ${data.passwordHash} WHERE id = ${id}`
}

export async function deleteUserById(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`
  return rows.length > 0
}

// ─── UGC Creators ────────────────────────────────────────────────

export async function getUGCCreators(brand?: string) {
  if (brand) return sql`SELECT * FROM ugc_creators WHERE brand = ${brand} ORDER BY created_at DESC`
  return sql`SELECT * FROM ugc_creators ORDER BY created_at DESC`
}

export async function createUGCCreator(data: Record<string, unknown>) {
  const m = (data.metrics as Record<string, number>) ?? {}
  const rows = await sql`
    INSERT INTO ugc_creators (
      name, handle, platform, followers, content_type, fee, free_product,
      publication_date, post_url, status, notes, brand, tags,
      metric_views, metric_likes, metric_comments, metric_reach, metric_saves
    ) VALUES (
      ${data.name as string}, ${data.handle as string}, ${data.platform as string},
      ${(data.followers as number) ?? 0}, ${data.contentType as string},
      ${(data.fee as string) ?? null}, ${(data.freeProduct as boolean) ?? false},
      ${(data.publicationDate as string) ?? null}, ${(data.postUrl as string) ?? null},
      ${(data.status as string) ?? 'contactado'}, ${(data.notes as string) ?? ''},
      ${data.brand as string}, ${JSON.stringify(data.tags ?? [])},
      ${m.views ?? null}, ${m.likes ?? null}, ${m.comments ?? null}, ${m.reach ?? null}, ${m.saves ?? null}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateUGCCreator(id: string, data: Record<string, unknown>) {
  const m = (data.metrics as Record<string, number>) ?? {}
  const rows = await sql`
    UPDATE ugc_creators SET
      name = ${data.name as string}, handle = ${data.handle as string},
      platform = ${data.platform as string}, followers = ${(data.followers as number) ?? 0},
      content_type = ${data.contentType as string}, fee = ${(data.fee as string) ?? null},
      free_product = ${(data.freeProduct as boolean) ?? false},
      publication_date = ${(data.publicationDate as string) ?? null},
      post_url = ${(data.postUrl as string) ?? null}, status = ${data.status as string},
      notes = ${(data.notes as string) ?? ''}, brand = ${data.brand as string},
      tags = ${JSON.stringify(data.tags ?? [])},
      metric_views = ${m.views ?? null}, metric_likes = ${m.likes ?? null},
      metric_comments = ${m.comments ?? null}, metric_reach = ${m.reach ?? null},
      metric_saves = ${m.saves ?? null}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] ?? null
}

export async function deleteUGCCreator(id: string) {
  await sql`DELETE FROM ugc_creators WHERE id = ${id}`
}

// ─── Videos ──────────────────────────────────────────────────────

export async function getVideos(brand?: string) {
  if (brand) return sql`SELECT * FROM videos WHERE brand = ${brand} ORDER BY created_at DESC`
  return sql`SELECT * FROM videos ORDER BY created_at DESC`
}

export async function createVideo(data: Record<string, unknown>) {
  const rows = await sql`
    INSERT INTO videos (title, platform, format, status, description, script, publish_date, post_url, tags, brand)
    VALUES (
      ${data.title as string}, ${data.platform as string}, ${data.format as string},
      ${(data.status as string) ?? 'idea'}, ${(data.description as string) ?? null},
      ${(data.script as string) ?? null}, ${(data.publishDate as string) ?? null},
      ${(data.postUrl as string) ?? null}, ${JSON.stringify(data.tags ?? [])}, ${data.brand as string}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateVideo(id: string, data: Record<string, unknown>) {
  const rows = await sql`
    UPDATE videos SET
      title = ${data.title as string}, platform = ${data.platform as string},
      format = ${data.format as string}, status = ${data.status as string},
      description = ${(data.description as string) ?? null},
      script = ${(data.script as string) ?? null},
      publish_date = ${(data.publishDate as string) ?? null},
      post_url = ${(data.postUrl as string) ?? null},
      tags = ${JSON.stringify(data.tags ?? [])}, brand = ${data.brand as string}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] ?? null
}

export async function deleteVideo(id: string) {
  await sql`DELETE FROM videos WHERE id = ${id}`
}

// ─── Content Ideas ────────────────────────────────────────────────

export async function getContentIdeas(brand?: string) {
  if (brand) return sql`SELECT * FROM content_ideas WHERE brand = ${brand} ORDER BY created_at DESC`
  return sql`SELECT * FROM content_ideas ORDER BY created_at DESC`
}

export async function createContentIdea(data: Record<string, unknown>) {
  const rows = await sql`
    INSERT INTO content_ideas (title, platform, format, description, hook, cta, priority, brand, tags, status)
    VALUES (
      ${data.title as string}, ${data.platform as string}, ${data.format as string},
      ${data.description as string}, ${(data.hook as string) ?? null},
      ${(data.cta as string) ?? null}, ${(data.priority as string) ?? 'media'},
      ${data.brand as string}, ${JSON.stringify(data.tags ?? [])},
      ${(data.status as string) ?? 'pendiente'}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateContentIdea(id: string, data: Record<string, unknown>) {
  const rows = await sql`
    UPDATE content_ideas SET
      title = ${data.title as string}, platform = ${data.platform as string},
      format = ${data.format as string}, description = ${data.description as string},
      hook = ${(data.hook as string) ?? null}, cta = ${(data.cta as string) ?? null},
      priority = ${data.priority as string}, brand = ${data.brand as string},
      tags = ${JSON.stringify(data.tags ?? [])}, status = ${data.status as string}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] ?? null
}

export async function deleteContentIdea(id: string) {
  await sql`DELETE FROM content_ideas WHERE id = ${id}`
}

// ─── Campaign Ideas ───────────────────────────────────────────────

export async function getCampaignIdeas(brand?: string) {
  if (brand) return sql`SELECT * FROM campaign_ideas WHERE brand = ${brand} ORDER BY created_at DESC`
  return sql`SELECT * FROM campaign_ideas ORDER BY created_at DESC`
}

export async function createCampaignIdea(data: Record<string, unknown>) {
  const rows = await sql`
    INSERT INTO campaign_ideas (title, platform, objective, description, budget, start_date, status, tags, brand)
    VALUES (
      ${data.title as string}, ${data.platform as string}, ${data.objective as string},
      ${data.description as string}, ${(data.budget as string) ?? null},
      ${(data.startDate as string) ?? null}, ${(data.status as string) ?? 'idea'},
      ${JSON.stringify(data.tags ?? [])}, ${data.brand as string}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateCampaignIdea(id: string, data: Record<string, unknown>) {
  const rows = await sql`
    UPDATE campaign_ideas SET
      title = ${data.title as string}, platform = ${data.platform as string},
      objective = ${data.objective as string}, description = ${data.description as string},
      budget = ${(data.budget as string) ?? null},
      start_date = ${(data.startDate as string) ?? null},
      status = ${data.status as string}, tags = ${JSON.stringify(data.tags ?? [])},
      brand = ${data.brand as string}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] ?? null
}

export async function deleteCampaignIdea(id: string) {
  await sql`DELETE FROM campaign_ideas WHERE id = ${id}`
}

// ─── Ephemeris ────────────────────────────────────────────────────

export async function getEphemeris(brand?: string) {
  if (brand) return sql`SELECT * FROM ephemeris WHERE brand = ${brand} OR brand IS NULL ORDER BY date ASC`
  return sql`SELECT * FROM ephemeris ORDER BY date ASC`
}

export async function createEphemerisEntry(data: Record<string, unknown>) {
  const rows = await sql`
    INSERT INTO ephemeris (date, title, type, notes, brand, recurring)
    VALUES (
      ${data.date as string}, ${data.title as string}, ${data.type as string},
      ${(data.notes as string) ?? null}, ${(data.brand as string) ?? null},
      ${(data.recurring as boolean) ?? false}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateEphemerisEntry(id: string, data: Record<string, unknown>) {
  const rows = await sql`
    UPDATE ephemeris SET
      date = ${data.date as string}, title = ${data.title as string},
      type = ${data.type as string}, notes = ${(data.notes as string) ?? null},
      brand = ${(data.brand as string) ?? null},
      recurring = ${(data.recurring as boolean) ?? false}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] ?? null
}

export async function deleteEphemerisEntry(id: string) {
  await sql`DELETE FROM ephemeris WHERE id = ${id}`
}

// ─── Mappers: snake_case DB → camelCase ──────────────────────────

export function mapUGCRow(row: Record<string, unknown>) {
  return {
    id: row.id, name: row.name, handle: row.handle, platform: row.platform,
    followers: row.followers, contentType: row.content_type, fee: row.fee,
    freeProduct: row.free_product, publicationDate: row.publication_date,
    postUrl: row.post_url, status: row.status, notes: row.notes,
    brand: row.brand, tags: row.tags ?? [], createdAt: row.created_at,
    metrics: { views: row.metric_views, likes: row.metric_likes,
      comments: row.metric_comments, reach: row.metric_reach, saves: row.metric_saves },
  }
}

export function mapVideoRow(row: Record<string, unknown>) {
  return {
    id: row.id, title: row.title, platform: row.platform, format: row.format,
    status: row.status, description: row.description, script: row.script,
    publishDate: row.publish_date, postUrl: row.post_url,
    tags: row.tags ?? [], brand: row.brand, createdAt: row.created_at,
  }
}

export function mapContentIdeaRow(row: Record<string, unknown>) {
  return {
    id: row.id, title: row.title, platform: row.platform, format: row.format,
    description: row.description, hook: row.hook, cta: row.cta,
    priority: row.priority, brand: row.brand, tags: row.tags ?? [],
    status: row.status, createdAt: row.created_at,
  }
}

export function mapCampaignIdeaRow(row: Record<string, unknown>) {
  return {
    id: row.id, title: row.title, platform: row.platform, objective: row.objective,
    description: row.description, budget: row.budget, startDate: row.start_date,
    status: row.status, tags: row.tags ?? [], brand: row.brand, createdAt: row.created_at,
  }
}
