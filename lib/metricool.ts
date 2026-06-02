// Metricool REST API client
// Docs: https://app.metricool.com/resources/apidocs/index.html
// Auth: X-Mc-Auth header + userId + blogId query params

const BASE_URL = 'https://app.metricool.com/api'

// Token and userId can come from env vars OR be passed explicitly (from settings page)
const getHeaders = (token?: string) => ({
  'X-Mc-Auth': token || process.env.METRICOOL_USER_TOKEN || '',
  'Content-Type': 'application/json',
})

const getUserId = (uid?: string) => uid || process.env.METRICOOL_USER_ID || ''

// Keep old exports for backward compat
const headers = () => getHeaders()
const userId = () => getUserId()

// ─── Brands ──────────────────────────────────────────────────────────
export async function getBrands(token?: string, uid?: string) {
  const res = await fetch(
    `${BASE_URL}/admin/simpleProfiles?userId=${getUserId(uid)}&blogId=0`,
    { headers: getHeaders(token), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`Metricool brands error: ${res.status}`)
  const data = await res.json()
  return data.data || []
}

// ─── Analytics Data (Data Studio format) ─────────────────────────────
export async function getAnalyticsData(
  brandId: number,
  from: string,
  to: string,
  metrics: string[]
) {
  const params = new URLSearchParams({
    userId: userId(),
    blogId: String(brandId),
  })

  const res = await fetch(
    `${BASE_URL}/analytics/v2/report?${params}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ from, to, fields: metrics }),
      next: { revalidate: 900 }, // 15 min cache
    }
  )
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Metricool analytics error ${res.status}: ${txt}`)
  }
  return res.json()
}

// ─── Meta Ads Campaigns ───────────────────────────────────────────────
// Key metrics for paid social reporting
export const META_CAMPAIGN_METRICS = [
  'FACA05', // name
  'FACA03', // start
  'FACA04', // stop
  'FACA07', // objective
  'FACA10', // impressions
  'FACA12', // reach
  'FACA13', // spent
  'FACA14', // clicks
  'FACA19', // CPC
  'FACA20', // CPM
  'FACA21', // CTR
  'FACA41', // leads
  'FACA77', // messaging conversations (WhatsApp)
  'FACA156', // results
  'FACA157', // results label
]

// ─── Google Ads Campaigns ─────────────────────────────────────────────
export const GOOGLE_CAMPAIGN_METRICS = [
  'GACA01', // name
  'GACA02', // start
  'GACA12', // stop
  'GACA03', // impressions
  'GACA04', // clicks
  'GACA05', // conversions
  'GACA07', // spent
  'GACA08', // CPM
  'GACA09', // CPC
  'GACA10', // CTR
  'GACA11', // ROAS
  'GACA13', // status
]

// ─── Instagram Evolution ──────────────────────────────────────────────
export const INSTAGRAM_METRICS = [
  'IGEV01', // followers
  'IGEV03', // follows gained/lost
  'IGEV04', // posts
  'IGEV06', // reach
  'IGEV09', // post interactions
  'IGEV16', // stories
  'IGEV22', // reels
  'IGEV23', // reels views
  'IGEV9999', // engagement
]

// ─── Scheduled Posts ─────────────────────────────────────────────────
export async function getScheduledPosts(brandId: number, from: string, to: string) {
  const params = new URLSearchParams({
    userId: userId(),
    blogId: String(brandId),
    init: from,
    end: to,
  })
  const res = await fetch(
    `${BASE_URL}/v2/scheduler/posts?${params}`,
    { headers: headers(), next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Metricool scheduler error: ${res.status}`)
  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────
export function formatDateForAPI(date: Date): string {
  // Format: YYYY-MM-DDTHH:MM:SS-03:00
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return `${y}-${m}-${d}T${h}:${min}:${s}-03:00`
}

export function startOfMonth(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
  return formatDateForAPI(d)
}

export function endOfMonth(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  return formatDateForAPI(d)
}
