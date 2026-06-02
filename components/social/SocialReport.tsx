'use client'
import { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, AlertCircle, Users, Eye, Heart, BookmarkPlus, Share2, Instagram, TrendingUp, MessageCircle, Film, FileText } from 'lucide-react'
import { metricoolParams } from '@/lib/config'
import type { Brand } from '@/lib/types'

function fmtN(n: number) {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('es-AR')
}

interface Props { brand: Brand }

export function SocialReport({ brand }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/metricool/social-stats?${metricoolParams(brand.id)}`)
      const from = res.headers.get('X-From') || ''
      const to = res.headers.get('X-To') || ''
      if (from && to) setPeriod(`${from} → ${to}`)
      setUpdatedAt(res.headers.get('X-Updated-At') || '')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar')
      setStats(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [brand.id])

  if (loading) return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-8 text-center">
      <RefreshCw size={24} className="text-slate-600 mx-auto mb-2 animate-spin" />
      <p className="text-slate-500 text-sm">Cargando reporte...</p>
    </div>
  )

  if (error || !stats) return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-10 text-center">
      <BarChart2 size={32} className="text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400 font-medium">Sin datos para este período</p>
      <p className="text-slate-600 text-sm mt-1">{error || 'Actualizá el cache desde Cowork'}</p>
    </div>
  )

  const cards = [
    { label: 'Seguidores', value: fmtN(stats.followers), sub: stats.followersGrowth > 0 ? `+${fmtN(stats.followersGrowth)} este período` : `${stats.followersGrowth} este período`, color: 'text-brand-pink', bg: 'bg-brand-pink/10 border-brand-pink/20', icon: <Users size={16} /> },
    { label: 'Alcance', value: fmtN(stats.reach), sub: 'personas alcanzadas', color: 'text-brand-teal', bg: 'bg-brand-teal/10 border-brand-teal/20', icon: <Eye size={16} /> },
    { label: 'Vistas de perfil', value: fmtN(stats.profileViews), sub: 'impresiones totales', color: 'text-brand-purple', bg: 'bg-brand-purple/10 border-brand-purple/20', icon: <Instagram size={16} /> },
    { label: 'Interacciones', value: fmtN(stats.interactions), sub: 'likes + comentarios', color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20', icon: <Heart size={16} /> },
    { label: 'Guardados', value: fmtN(stats.savedTotal || stats.postsSaved), sub: `posts: ${fmtN(stats.postsSaved)} · reels: ${fmtN(stats.reelsSaved)}`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <BookmarkPlus size={16} /> },
    { label: 'Compartidos', value: fmtN(stats.sharedTotal || stats.postsShares), sub: `posts: ${fmtN(stats.postsShares)} · reels: ${fmtN(stats.reelsShares)}`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: <Share2 size={16} /> },
    { label: 'Vistas de Reels', value: fmtN(stats.reelsViews), sub: `${stats.reels} reels publicados`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Film size={16} /> },
    { label: 'Stories', value: fmtN(stats.stories), sub: 'stories publicadas', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: <TrendingUp size={16} /> },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Instagram size={15} className="text-brand-pink" />
            <span className="text-sm text-slate-400">@{brand.networksData?.instagramData || 'simetfabrica'}</span>
          </div>
          {period && <p className="text-xs text-slate-600">Período: {period}</p>}
          {updatedAt && <p className="text-xs text-slate-600">Actualizado: {new Date(updatedAt).toLocaleDateString('es-AR')}</p>}
        </div>
        <button onClick={load} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <div key={card.label} className={`border rounded-xl p-4 ${card.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{card.label}</span>
              <span className={card.color}>{card.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Publishing breakdown */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Publicaciones del período</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-xl">📸</div>
            <div><div className="text-xl font-bold text-brand-pink">{stats.posts}</div><div className="text-xs text-slate-500">Posts</div></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-xl">🎬</div>
            <div><div className="text-xl font-bold text-brand-purple">{stats.reels}</div><div className="text-xs text-slate-500">Reels</div></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-xl">⭕</div>
            <div><div className="text-xl font-bold text-brand-teal">{stats.stories}</div><div className="text-xs text-slate-500">Stories</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
