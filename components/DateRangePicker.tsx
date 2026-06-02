'use client'
import { useState } from 'react'
import { Calendar, Search } from 'lucide-react'

interface Props {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

export function DateRangePicker({ from, to, onChange }: Props) {
  const [localFrom, setLocalFrom] = useState(from)
  const [localTo, setLocalTo] = useState(to)
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-bg-border rounded-lg">
        <Calendar size={13} className="text-slate-500" />
        <input type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)}
          className="bg-transparent text-sm text-slate-300 outline-none w-32" />
      </div>
      <span className="text-slate-600 text-xs">→</span>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-bg-border rounded-lg">
        <input type="date" value={localTo} onChange={e => setLocalTo(e.target.value)}
          className="bg-transparent text-sm text-slate-300 outline-none w-32" />
      </div>
      <button onClick={() => onChange(localFrom, localTo)}
        className="flex items-center gap-1.5 px-3 py-2 bg-brand-purple hover:bg-brand-purple-light rounded-lg text-sm font-medium text-white transition-colors">
        <Search size={13} /> Aplicar
      </button>
    </div>
  )
}
