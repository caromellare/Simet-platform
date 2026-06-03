'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { getEphemerisForMonth, EPHEMERIS_TYPE_STYLE } from '@/lib/ephemeris'
import type { Brand, Ephemeris } from '@/lib/types'

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  const set = (v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }
  return [value, set] as const
}

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface Props { brand: Brand }

export function CalendarView({ brand }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [customEvents, setCustomEvents] = useLocalStorage<Ephemeris[]>('cal_custom_events', [])
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({ date: '', title: '', notes: '', type: 'custom' as const })

  const ephemeris = getEphemerisForMonth(year, month)
  const brandEvents = customEvents.filter(e => e.date.startsWith(`${year}-${String(month).padStart(2, '0')}`))
  const allEvents = [...ephemeris, ...brandEvents]

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: Array<{ day: number | null }> = []
  for (let i = 0; i < firstDay; i++) cells.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d })
  while (cells.length % 7 !== 0) cells.push({ day: null })

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  function addEvent() {
    if (!newEvent.date || !newEvent.title.trim()) return
    setCustomEvents(prev => [...prev, { ...newEvent, id: Date.now().toString(), brand: brand.label }])
    setNewEvent({ date: '', title: '', notes: '', type: 'custom' })
    setShowAdd(false)
  }

  function eventsForDay(day: number) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return allEvents.filter(e => e.date === dateStr)
  }

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400"><ChevronLeft size={16} /></button>
          <h2 className="text-base font-semibold text-white w-44 text-center">{MONTHS_ES[month - 1]} {year}</h2>
          <button onClick={next} className="p-2 rounded-lg bg-bg-card border border-bg-border hover:bg-bg-elevated text-slate-400"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {([['nacional','Nacional'],['mundial','Mundial'],['comercial','Comercial'],['custom','Custom']] as [string,string][]).map(([type, label]) => {
              const s = EPHEMERIS_TYPE_STYLE[type]
              return (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: s.bg, borderColor: s.border }} />
                  {label}
                </span>
              )
            })}
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-bg-border hover:border-brand-teal/40 rounded-lg text-xs text-slate-300 hover:text-brand-teal transition-colors">
            <Plus size={12} /> Evento
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-bg-border">
          {DAYS_ES.map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const events = cell.day ? eventsForDay(cell.day) : []
            const today_ = cell.day && isToday(cell.day)
            return (
              <div
                key={idx}
                className={`min-h-[90px] border-r border-b border-bg-border last:border-r-0 p-2 ${
                  !cell.day ? 'bg-bg-base/30' : 'hover:bg-bg-elevated/30 transition-colors'
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {cell.day && (
                  <>
                    <div className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
                      today_ ? 'bg-brand-teal text-bg-base font-bold' : 'text-slate-500'
                    }`}>
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {events.slice(0, 3).map(ev => {
                        const s = EPHEMERIS_TYPE_STYLE[ev.type] ?? EPHEMERIS_TYPE_STYLE.custom
                        return (
                          <div
                            key={ev.id}
                            title={ev.title}
                            className="text-[10px] px-1.5 py-0.5 rounded truncate border font-medium"
                            style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                          >
                            {ev.title}
                          </div>
                        )
                      })}
                      {events.length > 3 && (
                        <div className="text-[10px] text-slate-500 px-1">+{events.length - 3} más</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* This month ephemeris list */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Efemérides del mes</h3>
        <div className="grid grid-cols-2 gap-2">
          {allEvents.sort((a, b) => a.date.localeCompare(b.date)).map(ev => {
            const s = EPHEMERIS_TYPE_STYLE[ev.type] ?? EPHEMERIS_TYPE_STYLE.custom
            return (
              <div
                key={ev.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
              >
                <span className="text-xs font-mono font-bold">{ev.date.slice(8)}</span>
                <span className="text-xs font-medium flex-1 truncate">{ev.title}</span>
                <span className="text-[10px] opacity-70 capitalize">{ev.type}</span>
                {ev.type === 'custom' && (
                  <button onClick={() => setCustomEvents(prev => prev.filter(e => e.id !== ev.id))} className="opacity-50 hover:opacity-100"><X size={10} /></button>
                )}
              </div>
            )
          })}
          {allEvents.length === 0 && <p className="text-xs text-slate-600 col-span-2">Sin efemérides para este mes</p>}
        </div>
      </div>

      {/* Add event modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-bg-border rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Agregar evento personalizado</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha</label>
                <input type="date" value={newEvent.date} onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Título</label>
                <input value={newEvent.title} onChange={e => setNewEvent(n => ({ ...n, title: e.target.value }))} placeholder="Nombre del evento" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notas (opcional)</label>
                <input value={newEvent.notes} onChange={e => setNewEvent(n => ({ ...n, notes: e.target.value }))} placeholder="Notas adicionales..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-bg-border hover:bg-bg-card transition-colors">Cancelar</button>
              <button onClick={addEvent} className="flex-1 py-2 rounded-lg text-sm font-medium bg-brand-teal/80 hover:bg-brand-teal text-bg-base transition-colors">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
