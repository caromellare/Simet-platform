'use client'
import { useState } from 'react'
import { Plus, X, Lightbulb, Instagram, Youtube, Trash2, Edit2, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { Brand, ContentIdea, UGCPlatform } from '@/lib/types'

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

const PRIORITY_CONFIG = {
  alta: { label: 'Alta', icon: <ArrowUp size={11} />, color: 'text-red-400 bg-red-500/10 border-red-500/25' },
  media: { label: 'Media', icon: <Minus size={11} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  baja: { label: 'Baja', icon: <ArrowDown size={11} />, color: 'text-slate-400 bg-slate-500/10 border-slate-500/25' },
}

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-slate-500/10 text-slate-400 border-slate-500/25' },
  en_proceso: { label: 'En proceso', color: 'bg-teal-500/10 text-teal-400 border-teal-500/25' },
  descartada: { label: 'Descartada', color: 'bg-red-500/10 text-red-400 border-red-500/25' },
}

const PLATFORMS: Array<{ key: UGCPlatform | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todas' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'otro', label: 'Otro' },
]

const EMPTY: Omit<ContentIdea, 'id' | 'createdAt'> = {
  title: '', platform: 'instagram', format: 'reels', description: '', hook: '', cta: '',
  priority: 'media', brand: '', tags: [], status: 'pendiente',
}

interface Props { brand: Brand }

export function IdeasBoard({ brand }: Props) {
  const [ideas, setIdeas] = useLocalStorage<ContentIdea[]>('social_ideas', [])
  const [filterPlatform, setFilterPlatform] = useState<UGCPlatform | 'todos'>('todos')
  const [filterPriority, setFilterPriority] = useState<'alta' | 'media' | 'baja' | 'todas'>('todas')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY, brand: brand.label })

  const brandIdeas = ideas.filter(i => i.brand === brand.label)
  const filtered = brandIdeas
    .filter(i => filterPlatform === 'todos' || i.platform === filterPlatform)
    .filter(i => filterPriority === 'todas' || i.priority === filterPriority)
    .filter(i => i.status !== 'descartada')
    .sort((a, b) => {
      const p = { alta: 0, media: 1, baja: 2 }
      return p[a.priority] - p[b.priority]
    })

  function save() {
    if (!form.title.trim()) return
    if (editingId) setIdeas(prev => prev.map(i => i.id === editingId ? { ...i, ...form } : i))
    else setIdeas(prev => [...prev, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }])
    setShowForm(false)
  }
  function del(id: string) { setIdeas(prev => prev.filter(i => i.id !== id)) }
  function discard(id: string) { setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: 'descartada' as const } : i)) }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {PLATFORMS.map(p => (
            <button key={p.key} onClick={() => setFilterPlatform(p.key as any)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterPlatform === p.key ? 'bg-brand-teal/15 text-brand-teal border border-brand-teal/25' : 'text-slate-400 hover:text-slate-200 bg-bg-card border border-bg-border'}`}>
              {p.label}
            </button>
          ))}
          <div className="w-px h-4 bg-bg-border mx-1" />
          {(['todas', 'alta', 'media', 'baja'] as const).map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filterPriority === p ? 'bg-bg-elevated text-white border border-bg-border' : 'text-slate-500 hover:text-slate-300'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => { setForm({ ...EMPTY, brand: brand.label }); setEditingId(null); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-purple hover:bg-brand-purple-light rounded-lg text-sm font-medium text-white transition-colors">
          <Plus size={14} /> Nueva idea
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-bg-card border border-bg-border rounded-xl p-12 text-center">
          <Lightbulb size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin ideas todavía</p>
          <p className="text-slate-600 text-sm mt-1">Agregá ideas de contenido para planificar tu estrategia</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(idea => {
            const p = PRIORITY_CONFIG[idea.priority]
            return (
              <div key={idea.id} className="bg-bg-card border border-bg-border rounded-xl p-4 hover:border-brand-purple/25 transition-all card-hover group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-medium text-slate-200 leading-snug flex-1">{idea.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setForm({ title: idea.title, platform: idea.platform, format: idea.format, description: idea.description, hook: idea.hook || '', cta: idea.cta || '', priority: idea.priority, brand: idea.brand, tags: idea.tags, status: idea.status }); setEditingId(idea.id); setShowForm(true) }} className="p-1 rounded-md hover:bg-bg-elevated text-slate-500 hover:text-slate-300"><Edit2 size={12} /></button>
                    <button onClick={() => del(idea.id)} className="p-1 rounded-md hover:bg-bg-elevated text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge ${p.color}`}>{p.icon}{p.label}</span>
                  <span className="badge bg-bg-elevated border-bg-border text-slate-400 text-[10px] capitalize">{idea.platform}</span>
                  <span className="badge bg-bg-elevated border-bg-border text-slate-400 text-[10px]">{idea.format}</span>
                </div>
                {idea.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{idea.description}</p>}
                {idea.hook && (
                  <div className="mb-2">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Hook</span>
                    <p className="text-xs text-slate-400 mt-0.5 italic">"{idea.hook}"</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-bg-border mt-3">
                  <select value={idea.status} onChange={e => setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: e.target.value as any } : i))} className={`text-[10px] badge border cursor-pointer bg-transparent ${STATUS_CONFIG[idea.status].color}`}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button onClick={() => discard(idea.id)} className="text-[10px] text-slate-600 hover:text-red-400 transition-colors">Descartar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-bg-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h2 className="text-base font-semibold text-white">{editingId ? 'Editar idea' : 'Nueva idea'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Título *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la idea" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Plataforma</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as any }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {(['instagram', 'tiktok', 'youtube', 'facebook', 'otro'] as UGCPlatform[]).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Formato</label>
                  <input value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} placeholder="reels, post..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Descripción del contenido..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Hook / Apertura</label>
                <input value={form.hook} onChange={e => setForm(f => ({ ...f, hook: e.target.value }))} placeholder="Primera frase que engancha..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">CTA</label>
                <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} placeholder="Llamado a la acción..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-bg-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-bg-card border border-bg-border transition-colors">Cancelar</button>
              <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-purple hover:bg-brand-purple-light text-white transition-colors">{editingId ? 'Guardar' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
