import { NextResponse } from 'next/server'
import { getAnalyticsData, INSTAGRAM_METRICS, startOfMonth, endOfMonth } from '@/lib/metricool'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = Number(searchParams.get('brandId') || process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID || 1674000)
  const monthParam = searchParams.get('month')
  const token = searchParams.get('token') || undefined
  const userId = searchParams.get('userId') || undefined

  const refDate = monthParam ? new Date(`${monthParam}-01`) : new Date()
  const from = startOfMonth(refDate)
  const to = endOfMonth(refDate)

  try {
    const raw = await getAnalyticsData(brandId, from, to, INSTAGRAM_METRICS, token, userId)
    // Parse totals from time series
    const stats = aggregateStats(raw)
    return NextResponse.json(stats)
  } catch (err: any) {
    console.error('[API] social-stats error:', err)
    return NextResponse.json({ error: err.message || 'Error Metricool' }, { status: 500 })
  }
}

function aggregateStats(raw: any) {
  // Positional rows — matches INSTAGRAM_METRICS order:
  // 0:followers, 1:followersGrowth, 2:posts, 3:reach,
  // 4:interactions, 5:stories, 6:reels, 7:reelsViews
  if (!raw?.rows || !Array.isArray(raw.rows)) return null

  const n = (val: any) => parseFloat(val ?? 0) || 0

  return raw.rows.reduce((acc: any, row: any[]) => ({
    followers:      Math.max(acc.followers || 0, n(row[0])),
    followersGrowth:(acc.followersGrowth || 0) + n(row[1]),
    posts:          (acc.posts || 0) + n(row[2]),
    reach:          (acc.reach || 0) + n(row[3]),
    interactions:   (acc.interactions || 0) + n(row[4]),
    stories:        (acc.stories || 0) + n(row[5]),
    reels:          (acc.reels || 0) + n(row[6]),
    reelsViews:     (acc.reelsViews || 0) + n(row[7]),
  }), {})
}
