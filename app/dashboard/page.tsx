'use client'
import { useState, useEffect } from 'react'
import { Users, Share2, DollarSign, TrendingUp, TrendingDown, Eye, MousePointer, ArrowRight, CheckSquare, Instagram, RefreshCw, Minus } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/StatCard'

const DEFAULT_BRAND_ID = 1674000

function fmtN(n: number) {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('es-AR')
}

// Devuelve las fechas del período actual y el anterior (últimos 30 días vs 30 días antes)
function getPeriods() {
  const now = new Date()
  const to   = now.toISOString().slice(0, 10)
  const from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
  const prevTo   = new Date(now.getTime() - 31 * 86400000).toISOString().slice(0, 10)
  const prevFrom = new Date(now.getTime() - 61 * 86400000).toISOString().slice(0, 10)
  return { from, to, prevFrom, prevTo }
}

function pctChange(current: number, previous: number) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const pct = pctChange(current, previous)
  if (pct === null) return null
  const up = pct >= 0
  const color = up ? 'text-green-400' : 'text-red-400'
  const Icon = Math.abs(pct) < 0.5 ? Minus : up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${color}`}>
      <Icon size={10} />
      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

export default function DashboardPage() {
  const [metaStats, setMetaStats]       = useState<any>(null)
  const [prevMetaStats, setPrevMeta]    = useState<any>(null)
  const [googleStats, setGoogleStats]   = useState<any>(null)
  const [prevGoogleStats, setPrevGoogle]= useState<any>(null)
  const [socialStats, setSocialStats]   = useState<any>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const brandId = DEFAULT_BRAND_ID
    const { from, to, prevFrom, prevTo } = getPeriods()

    const sumMeta = (arr: any[]) => Array.isArray(arr) ? {
      impressions:     arr.reduce((s: number, c: any) => s + (c.impressions || 0), 0),
      spent:           arr.reduce((s: number, c: any) => s + (c.spent || 0), 0),
      waConversations: arr.reduce((s: number, c: any) => s + (c.messagingConversations || 0), 0),
    } : null

    const sumGoogle = (arr: any[]) => Array.isArray(arr) ? {
      impressions: arr.reduce((s: number, c: any) => s + (c.impressions || 0), 0),
      clicks:      arr.reduce((s: number, c: any) => s + (c.clicks || 0), 0),
    } : null

    Promise.all([
      fetch(`/api/metricool/meta-campaigns?brandId=${brandId}&from=${from}&to=${to}`).then(r => r.json()).catch(() => []),
      fetch(`/api/metricool/meta-campaigns?brandId=${brandId}&from=${prevFrom}&to=${prevTo}`).then(r => r.json()).catch(() => []),
      fetch(`/api/metricool/google-campaigns?brandId=${brandId}&from=${from}&to=${to}`).then(r => r.json()).catch(() => []),
      fetch(`/api/metricool/google-campaigns?brandId=${brandId}&from=${prevFrom}&to=${prevTo}`).then(r => r.json()).catch(() => []),
      fetch(`/api/metricool/social-stats?brandId=${brandId}`).then(r => r.json()).catch(() => null),
    ]).then(([meta, prevMeta, google, prevGoogle, social]) => {
      setMetaStats(sumMeta(meta))
      setPrevMeta(sumMeta(prevMeta))
      setGoogleStats(sumGoogle(google))
      setPrevGoogle(sumGoogle(prevGoogle))
      if (social && !social.error) setSocialStats(social)
      setLoading(false)
    })
  }, [])

  const quickLinks = [
    { href: '/ugc',    label: 'UGC & Influencers', desc: 'Rastrear colaboraciones activas',       icon: <Users size={22} className="text-brand-pink" />,   accent: '#e879a0' },
    { href: '/social', label: 'Social Media',      desc: 'Calendario, videos, ideas y reportes', icon: <Share2 size={22} className="text-brand-teal" />,   accent: '#2dd4bf' },
    { href: '/tareas', label: 'Tareas',            desc: 'Kanban del equipo y videos en pauta',  icon: <CheckSquare size={22} className="text-brand-green" />, accent: '#4ade80' },
    { href: '/paid',   label: 'Paid Media',        desc: 'Campañas Meta Ads y Google Ads',       icon: <DollarSign size={22} className="text-brand-orange" />, accent: '#fb923c' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Buen día, Caro 👋</h1>
        <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Real KPIs */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance últimos 30 días — Simet Fábrica</h2>
          {loading && <RefreshCw size={13} className="text-slate-600 animate-spin" />}
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-bg-card border border-meta-blue/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-meta-blue" /> Meta Ads · Impresiones
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-white">{fmtN(metaStats?.impressions || 0)}</div>
                {!loading && prevMetaStats && <DeltaBadge current={metaStats?.impressions || 0} previous={prevMetaStats?.impressions || 0} />}
              </div>
            )}
            <div className="text-xs text-slate-600 mt-1">vs. período anterior</div>
          </div>
          <div className="bg-bg-card border border-google-blue/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-google-blue" /> Google Ads · Impresiones
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-white">{fmtN(googleStats?.impressions || 0)}</div>
                {!loading && prevGoogleStats && <DeltaBadge current={googleStats?.impressions || 0} previous={prevGoogleStats?.impressions || 0} />}
              </div>
            )}
            <div className="text-xs text-slate-600 mt-1">vs. período anterior</div>
          </div>
          <div className="bg-bg-card border border-brand-teal/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Instagram size={12} className="text-brand-pink" /> Orgánico · Alcance
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-white">{fmtN(socialStats?.reach || 0)}</div>
                {socialStats?.reachPrev > 0 && <DeltaBadge current={socialStats.reach || 0} previous={socialStats.reachPrev} />}
              </div>
            )}
            <div className="text-xs text-slate-600 mt-1">personas alcanzadas orgánicamente</div>
          </div>
          <div className="bg-bg-card border border-brand-purple/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Eye size={12} className="text-brand-purple" /> Vistas al perfil
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-white">{fmtN(socialStats?.profileViews || 0)}</div>
                {socialStats?.profileViewsPrev > 0 && <DeltaBadge current={socialStats.profileViews || 0} previous={socialStats.profileViewsPrev} />}
              </div>
            )}
            <div className="text-xs text-slate-600 mt-1">impresiones del perfil de Instagram</div>
          </div>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 flex items-center gap-3">
            <div className="text-lg">💬</div>
            <div>
              {loading ? <div className="h-5 w-12 bg-bg-elevated rounded animate-pulse" /> : <div className="text-lg font-bold text-green-400">{fmtN(metaStats?.waConversations || 0)}</div>}
              <div className="text-xs text-slate-500">Conv. WhatsApp</div>
            </div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 flex items-center gap-3">
            <div className="text-lg">🎬</div>
            <div>
              {loading ? <div className="h-5 w-12 bg-bg-elevated rounded animate-pulse" /> : <div className="text-lg font-bold text-brand-purple">{fmtN(socialStats?.reelsViews || 0)}</div>}
              <div className="text-xs text-slate-500">Vistas de Reels</div>
            </div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 flex items-center gap-3">
            <div className="text-lg">🔖</div>
            <div>
              {loading ? <div className="h-5 w-12 bg-bg-elevated rounded animate-pulse" /> : <div className="text-lg font-bold text-amber-400">{fmtN(socialStats?.savedTotal || 0)}</div>}
              <div className="text-xs text-slate-500">Guardados</div>
            </div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 flex items-center gap-3">
            <div className="text-lg">👥</div>
            <div>
              {loading ? <div className="h-5 w-12 bg-bg-elevated rounded animate-pulse" /> : <div className="text-lg font-bold text-white">{fmtN(socialStats?.followers || 0)}</div>}
              <div className="text-xs text-slate-500">{socialStats?.followersGrowth > 0 ? `+${fmtN(socialStats.followersGrowth)} seguidores` : 'Seguidores'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative block rounded-2xl p-5 border border-white/8 bg-bg-card overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] cursor-pointer"
              style={{ boxShadow: `0 0 0 0 ${link.accent}` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px -4px ${link.accent}55`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Colored top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-80 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: link.accent }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${link.accent}18` }}>
                  {link.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border border-white/10 text-slate-400 group-hover:text-white group-hover:border-white/20 transition-all">
                  Ir <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{link.label}</h3>
              <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
