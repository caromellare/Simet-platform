'use client'
import { useState, useEffect } from 'react'
import { BarChart2, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Instagram, Users, Eye, Heart, TrendingUp, Camera, Play, Circle } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { metricoolParams } from '@/lib/config'
import type { Brand, SocialStats } from '@/lib/types'

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fmtNumber(n: number) {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('es-AR')
}

function buildSummary(stats: SocialStats, month: string): string {
  const parts: string[] = []
  if (stats.followers) {
    parts.push(`La cuenta terminó el mes con ${stats.followers.toLocaleString('es-AR')} seguidores`)
    if (stats.followersGrowth) {
      const sign = stats.followersGrowth > 0 ? '+' : ''
      parts.push(`(${sign}${stats.followersGrowth} durante ${month})`)
    }
  }
  if (stats.reach) parts.push(`alcanzando a ${fmtNumber(stats.reach)} personas`)
  if (stats.interactions) parts.push(`con ${fmtNumber(stats.interactions)} interacciones totales`)

  const content: string[] = []
  if (stats.reels) content.push(`${stats.reels} reel${stats.reels !== 1 ? 's' : ''}`)
  if (stats.stories) content.push(`${stats.stories} storie${stats.stories !== 1 ? 's' : ''}`)
  if (stats.posts) content.push(`${stats.posts} post${stats.posts !== 1 ? 's' : ''}`)

  if (content.length > 0) parts.push(`Se publicaron ${content.join(', ')}`)
  if (stats.reelsViews) parts.push(`Los reels acumularon ${fmtNumber(stats.reelsViews)} vistas`)

  return parts.join('. ') + '.'
}

interface Props { brand: Brand }

export function SocialReport({ brand }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [stats, setStats] = useState<SocialStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const res = await fetch(`/api/metricool/social-stats?${metricoolParams(brand.id, { month: monthStr })}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar datos')
      setStats(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [brand.id, month, year])

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => {
    const isFuture = year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth() + 1)
    if (!isFuture) { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  }

  return (
    <div>
      {/* Month selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400"><ChevronLeft size={16} /></button>
          <span className="text-base font-semibold text-white w-44 text-center">{MONTHS_ES[month - 1]} {year}</span>
          <button onClick={next} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-bg-border">
            <Instagram size={14} className="text-brand-pink" />
            <span className="text-xs text-slate-400">@{brand.networksData?.instagramData || '—'}</span>
          </div>
          <button onClick={load} disabled={loading} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400 disabled:opacity-50 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">No se pudieron cargar los datos</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            <p className="text-xs text-slate-500 mt-1">Verificá que <code className="text-brand-purple">METRICOOL_USER_TOKEN</code> esté configurado en Vercel</p>
          </div>
        </div>
      )}

      {/* Key stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Seguidores"
          value={stats?.followers?.toLocaleString('es-AR') || '—'}
          sub={stats?.followersGrowth != null ? `${stats.followersGrowth > 0 ? '+' : ''}${stats.followersGrowth} este mes` : undefined}
          color="pink" icon={<Users size={14} />} loading={loading}
        />
        <StatCard
          label="Alcance total"
          value={stats?.reach ? fmtNumber(stats.reach) : '—'}
          sub="posts + stories + reels"
          color="teal" icon={<Eye size={14} />} loading={loading}
        />
        <StatCard
          label="Interacciones"
          value={stats?.interactions ? fmtNumber(stats.interactions) : '—'}
          sub="likes + comments + saves"
          color="purple" icon={<Heart size={14} />} loading={loading}
        />
        <StatCard
          label="Vistas de Reels"
          value={stats?.reelsViews ? fmtNumber(stats.reelsViews) : '—'}
          sub={stats?.reels != null ? `${stats.reels} reel${stats.reels !== 1 ? 's' : ''} publicado${stats.reels !== 1 ? 's' : ''}` : undefined}
          color="orange" icon={<TrendingUp size={14} />} loading={loading}
        />
      </div>

      {/* Publishing breakdown */}
      {stats && !loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Reels publicados', value: stats.reels || 0, icon: <Play size={18} />, color: 'text-brand-purple', bg: 'bg-brand-purple/10 border-brand-purple/20' },
            { label: 'Stories publicadas', value: stats.stories || 0, icon: <Circle size={18} />, color: 'text-brand-teal', bg: 'bg-brand-teal/10 border-brand-teal/20' },
            { label: 'Posts publicados', value: stats.posts || 0, icon: <Camera size={18} />, color: 'text-brand-pink', bg: 'bg-brand-pink/10 border-brand-pink/20' },
          ].map(item => (
            <div key={item.label} className={`bg-bg-card border ${item.bg} rounded-xl p-5 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <div className={`text-3xl font-bold ${item.color}`}>{item.value.toLocaleString('es-AR')}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen del mes */}
      {stats && !loading && (
        <div className="bg-bg-card border border-bg-border rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={15} className="text-brand-teal" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Resumen del mes</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {buildSummary(stats, MONTHS_ES[month - 1])}
          </p>
        </div>
      )}

      {/* No data placeholder */}
      {!loading && !error && !stats && (
        <div className="bg-bg-card border border-bg-border rounded-xl p-12 text-center">
          <BarChart2 size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin datos para este período</p>
          <p className="text-slate-600 text-sm mt-1">Conectá Metricool para ver el reporte mensual automático</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="h-32 bg-bg-card border border-bg-border rounded-xl animate-pulse" />
          <div className="h-20 bg-bg-card border border-bg-border rounded-xl animate-pulse" />
        </div>
      )}
    </div>
  )
}
