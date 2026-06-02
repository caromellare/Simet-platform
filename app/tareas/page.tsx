'use client'
import { useState } from 'react'
import { CheckSquare, Video } from 'lucide-react'
import { TaskKanban } from '@/components/tareas/TaskKanban'
import { VideosPauta } from '@/components/tareas/VideosPauta'

type TareasView = 'tareas' | 'videos'

const TABS: { key: TareasView; label: string; icon: React.ReactNode }[] = [
  { key: 'tareas', label: 'Tareas', icon: <CheckSquare size={14} /> },
  { key: 'videos', label: 'Videos en pauta', icon: <Video size={14} /> },
]

export default function TareasPage() {
  const [view, setView] = useState<TareasView>('tareas')

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-green/10 border border-brand-green/25 flex items-center justify-center">
            <CheckSquare size={18} className="text-brand-green" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Tareas</h1>
            <p className="text-xs text-slate-500">Gestión de tareas y videos en pauta</p>
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
                ? 'bg-brand-green/15 text-brand-green border border-brand-green/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={view}>
        {view === 'tareas' && <TaskKanban />}
        {view === 'videos' && <VideosPauta />}
      </div>
    </div>
  )
}
