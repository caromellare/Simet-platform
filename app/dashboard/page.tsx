'use client'
import { useState } from 'react'
import { Users, Share2, DollarSign, TrendingUp, Eye, MousePointer, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/StatCard'
import type { Brand } from '@/lib/types'

const DEFAULT_BRAND_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_BRAND_ID || 1674000)

export default function DashboardPage() {
  const [brandId, setBrandId] = useState(DEFAULT_BRAND_ID)

  const quickLinks = [
    {
      href: '/ugc',
      label: 'UGC & Influencers',
      desc: 'Rastrear colaboraciones y UGC activos',
      icon: <Users size={20} className="text-brand-pink" />,
      color: 'border-brand-pink/20 hover:border-brand-pink/40',
      bg: 'bg-brand-pink/5',
    },
    {
      href: '/social',
      label: 'Social Media',
      desc: 'Calendario, videos, ideas y reportes',
      icon: <Share2 size={20} className="text-brand-teal" />,
      color: 'border-brand-teal/20 hover:border-brand-teal/40',
      bg: 'bg-brand-teal/5',
    },
    {
      href: '/paid',
      label: 'Paid Media',
      desc: 'Campañas Meta Ads y Google Ads',
      icon: <DollarSign size={20} className="text-brand-orange" />,
      color: 'border-brand-orange/20 hover:border-brand-orange/40',
      bg: 'bg-brand-orange/5',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Buen día, Caro 👋</h1>
        <p className="text-slate-500 text-sm">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Campañas activas" value="—" sub="Ver en Paid Media" color="orange" icon={<DollarSign size={14} />} />
        <StatCard label="Influencers activos" value="—" sub="Ver en UGC" color="pink" icon={<Users size={14} />} />
        <StatCard label="Videos en pipeline" value="—" sub="Ver en Social" color="teal" icon={<Share2 size={14} />} />
        <StatCard label="Ideas pendientes" value="—" sub="Por planificar" color="purple" icon={<TrendingUp size={14} />} />
      </div>

      {/* Module cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Módulos</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`group block bg-bg-card border rounded-xl p-5 transition-all ${link.color} ${link.bg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center">
                  {link.icon}
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors mt-1" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{link.label}</h3>
              <p className="text-xs text-slate-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Info tip */}
      <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-xl p-4 flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs text-brand-purple font-bold">i</span>
        </div>
        <div>
          <p className="text-sm text-slate-300 font-medium">Conectá tu token de Metricool para ver datos en tiempo real</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración → API → Token de acceso. Luego agregalo como <code className="text-brand-purple">METRICOOL_USER_TOKEN</code> en Vercel.
          </p>
        </div>
      </div>
    </div>
  )
}
