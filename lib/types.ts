// ─── Metricool Brands ───────────────────────────────────────────────
export interface Brand {
  id: number
  label: string
  image: string
  timezone: string
  networksData: {
    facebookData?: string
    instagramData?: string
    linkedinData?: string
    facebookAdsData?: string
    googleAdsData?: string
    tiktokData?: string
    youtubeData?: string
    twitterData?: string
  }
}

// ─── Paid Media ──────────────────────────────────────────────────────
export interface MetaCampaign {
  id: string
  name: string
  start: string
  stop: string
  objective: string
  impressions: number
  reach: number
  clicks: number
  spent: number
  cpc: number
  cpm: number
  ctr: number
  leads: number
  messagingConversations: number
  results: number
  resultsLabel: string
  costPerResult: number
  status?: 'active' | 'paused' | 'ended'
}

export interface GoogleCampaign {
  name: string
  start: string
  stop: string
  impressions: number
  clicks: number
  conversions: number
  spent: number
  cpm: number
  cpc: number
  ctr: number
  roas: number
  status: string
}

// ─── Campaign Ideas ───────────────────────────────────────────────────
export interface CampaignIdea {
  id: string
  title: string
  platform: 'meta' | 'google' | 'ambos'
  objective: string
  description: string
  budget?: string
  startDate?: string
  status: 'idea' | 'aprobada' | 'en_produccion' | 'activa' | 'pausada'
  tags: string[]
  createdAt: string
  brand: string
}

// ─── UGC / Influencers ───────────────────────────────────────────────
export type UGCStatus = 'contactado' | 'negociacion' | 'confirmado' | 'produccion' | 'publicado' | 'cancelado'
export type UGCPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'otro'
export type ContentType = 'reels' | 'post' | 'story' | 'video' | 'ugc_puro' | 'review' | 'unboxing'

export interface UGCCreator {
  id: string
  name: string
  handle: string
  platform: UGCPlatform
  followers: number
  contentType: ContentType
  fee?: string
  freeProduct?: boolean
  publicationDate?: string
  postUrl?: string
  status: UGCStatus
  notes: string
  brand: string
  tags: string[]
  createdAt: string
  metrics?: {
    views?: number
    likes?: number
    comments?: number
    reach?: number
    saves?: number
  }
}

// ─── Social Media ─────────────────────────────────────────────────────
export type VideoStatus = 'idea' | 'guion' | 'grabacion' | 'edicion' | 'revision' | 'publicado'

export interface VideoItem {
  id: string
  title: string
  platform: UGCPlatform
  format: 'reels' | 'tiktok' | 'youtube_short' | 'youtube_largo' | 'story' | 'post_video'
  status: VideoStatus
  description?: string
  script?: string
  publishDate?: string
  postUrl?: string
  tags: string[]
  brand: string
  createdAt: string
}

export interface ContentIdea {
  id: string
  title: string
  platform: UGCPlatform | 'todos'
  format: string
  description: string
  hook?: string
  cta?: string
  priority: 'alta' | 'media' | 'baja'
  brand: string
  tags: string[]
  createdAt: string
  status: 'pendiente' | 'en_proceso' | 'descartada'
}

export interface Ephemeris {
  id: string
  date: string // YYYY-MM-DD
  title: string
  type: 'nacional' | 'mundial' | 'comercial' | 'sectorial' | 'custom'
  notes?: string
  brand?: string
  recurring?: boolean
}

// ─── Social Stats ─────────────────────────────────────────────────────
export interface SocialStats {
  followers: number
  followersGrowth: number
  posts: number
  reels: number
  stories: number
  reach: number
  interactions: number
  reelsViews: number
  engagement: number
}

// ─── Shared ───────────────────────────────────────────────────────────
export type Module = 'dashboard' | 'ugc' | 'social' | 'paid'
export type SocialView = 'calendar' | 'kanban' | 'ideas' | 'report'
export type PaidView = 'meta' | 'google' | 'ideas' | 'best-ads'
