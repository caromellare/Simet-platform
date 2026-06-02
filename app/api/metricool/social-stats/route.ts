import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId') || '1674000'

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'social-stats.json')
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (raw.brandId !== Number(brandId)) {
      return NextResponse.json(null)
    }

    return NextResponse.json(aggregateStats(raw), {
      headers: { 'X-Updated-At': raw.updatedAt || '' }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'No hay datos en cache.' }, { status: 404 })
  }
}

function aggregateStats(raw: any) {
  // 0:followers, 1:followersGrowth, 2:posts, 3:reach, 4:interactions, 5:stories, 6:reels, 7:reelsViews
  if (!raw?.rows || !Array.isArray(raw.rows)) return null
  const n = (val: any) => parseFloat(val ?? 0) || 0
  return raw.rows.reduce((acc: any, row: any[]) => ({
    followers:       Math.max(acc.followers || 0, n(row[0])),
    followersGrowth: (acc.followersGrowth || 0) + n(row[1]),
    posts:           (acc.posts || 0) + n(row[2]),
    reach:           (acc.reach || 0) + n(row[3]),
    interactions:    (acc.interactions || 0) + n(row[4]),
    stories:         (acc.stories || 0) + n(row[5]),
    reels:           (acc.reels || 0) + n(row[6]),
    reelsViews:      (acc.reelsViews || 0) + n(row[7]),
  }), {})
}
