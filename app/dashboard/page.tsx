'use client'
import { useState, useEffect } from 'react'
import { Users, Share2, DollarSign, TrendingUp, Eye, MousePointer, ArrowRight, CheckSquare, Instagram, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/StatCard'

const DEFAULT_BRAND_ID = 1674000

function fmtN(n: number) {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('es-AR')
}

export default function DashboardPage() {
  const [metaStats, setMetaStats] = useState<any>(null)
  const [googleStats, setGoogleStats] = useState<any>(null)
  const [socialStats, setSocialStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const brandId = DEFAULT_BRAND_ID
    Promise.all([
      fetch(`/api/metricool/meta-campaigns?brandId=${brandId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/metricool/google-campaigns?brandId=${brandId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/metricool/social-stats?brandId=${brandId}`).then(r => r.json()).catch(() => null),
    ]).then(([meta, google, social]) => {
      if (Array.isArray(meta)) {
        const totalImpressions = meta.reduce((s: number, c: any) => s + (c.impressions || 0), 0)
        const totalSpent = meta.reduce((s: number, c: any) => s + (c.spent || 0), 0)
        const totalWA = meta.reduce((s: number, c: any) => s + (c.messagingConversations || 0), 0)
        setMetaStats({ impressions: totalImpressions, spent: totalSpent, waConversations: totalWA })
      }
      if (Array.isArray(google)) {
        const totalImpressions = google.reduce((s: number, c: any) => s + (c.impressions || 0), 0)
        const totalClicks = google.reduce((s: number, c: any) => s + (c.clicks || 0), 0)
        setGoogleStats({ impressions: totalImpressions, clicks: totalClicks })
      }
      if (social && !social.error) setSocialStats(social)
      setLoading(false)
    })
  }, [])

  const quickLinks = [
    { href: '/ugc', label: 'UGC & Influencers', desc: 'Rastrear colaboraciones activas', icon: <Users size={20} className="text-brand-pink" />, color: 'border-brand-pink/20 hover:border-brand-pink/40', bg: 'bg-brand-pink/5' },
    { href: '/social', label: 'Social Media', desc: 'Calendario, videos, ideas y reportes', icon: <Share2 size={20} className="text-brand-teal" />, color: 'border-brand-teal/20 hover:border-brand-teal/40', bg: 'bg-brand-teal/5' },
    { href: '/tareas', label: 'Tareas', desc: 'Kanban del equipo y videos en pauta', icon: <CheckSquare size={20} className="text-brand-green" />, color: 'border-brand-green/20 hover:border-brand-green/40', bg: 'bg-brand-green/5' },
    { href: '/paid', label: 'Paid Media', desc: 'Campañas Meta Ads y Google Ads', icon: <DollarSign size={20} className="text-brand-orange" />, color: 'border-brand-orange/20 hover:border-brand-orange/40', bg: 'bg-brand-orange/5' },
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
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : <div className="text-2xl font-bold text-white">{fmtN(metaStats?.impressions || 0)}</div>}
            <div className="text-xs text-slate-600 mt-1">personas que vieron los anuncios</div>
          </div>
          <div className="bg-bg-card border border-google-blue/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-google-blue" /> Google Ads · Impresiones
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : <div className="text-2xl font-bold text-white">{fmtN(googleStats?.impressions || 0)}</div>}
            <div className="text-xs text-slate-600 mt-1">búsquedas que mostraron el anuncio</div>
          </div>
          <div className="bg-bg-card border border-brand-teal/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Instagram size={12} className="text-brand-pink" /> Orgánico · Alcance
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : <div className="text-2xl font-bold text-white">{fmtN(socialStats?.reach || 0)}</div>}
            <div className="text-xs text-slate-600 mt-1">personas alcanzadas orgánicamente</div>
          </div>
          <div className="bg-bg-card border border-brand-purple/20 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Eye size={12} className="text-brand-purple" /> Vistas al perfil
            </div>
            {loading ? <div className="h-7 w-20 bg-bg-elevated rounded animate-pulse" /> : <div className="text-2xl font-bold text-white">{fmtN(socialStats?.profileViews || 0)}</div>}
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
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Módulos</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} className={`group block bg-bg-card border rounded-xl p-4 transition-all ${link.color} ${link.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center">{link.icon}</div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors mt-1" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-0.5">{link.label}</h3>
              <p className="text-xs text-slate-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
