'use client'
import { useState } from 'react'
import { Share2, Calendar, LayoutGrid, Lightbulb, BarChart2 } from 'lucide-react'
import { CalendarView } from '@/components/social/CalendarView'
import { VideoKanban } from '@/components/social/VideoKanban'
import { IdeasBoard } from '@/components/social/IdeasBoard'
import { SocialReport } from '@/components/social/SocialReport'
import type { Brand, SocialView } from '@/lib/types'

const DEFAULT_BRAND = { id: 1674000, label: 'Simet Fábrica' } as Brand

const TABS: { key: SocialView; label: string; icon: React.ReactNode }[] = [
  { key: 'calendar', label: 'Calendario', icon: <Calendar size={14} /> },
  { key: 'kanban', label: 'Videos', icon: <LayoutGrid size={14} /> },
  { key: 'ideas', label: 'Ideas', icon: <Lightbulb size={14} /> },
  { key: 'report', label: 'Reportes', icon: <BarChart2 size={14} /> },
]

export default function SocialPage() {
  const [view, setView] = useState<SocialView>('calendar')
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-teal/10 border border-brand-teal/25 flex items-center justify-center">
            <Share2 size={18} className="text-brand-teal" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Social Media</h1>
            <p className="text-xs text-slate-500">Calendario, videos, ideas y reportes mensuales</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-bg-card border border-bg-border rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === tab.key
                ? 'bg-brand-teal/15 text-brand-teal border border-brand-teal/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in" key={view}>
        {view === 'calendar' && <CalendarView brand={brand} />}
        {view === 'kanban' && <VideoKanban brand={brand} />}
        {view === 'ideas' && <IdeasBoard brand={brand} />}
        {view === 'report' && <SocialReport brand={brand} />}
      </div>
    </div>
  )
}
