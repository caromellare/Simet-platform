'use client'
import { useState } from 'react'
import { Plus, X, Trash2, Edit2, Facebook, Search, Lightbulb, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { Brand, CampaignIdea } from '@/lib/types'

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

const STATUS_CONFIG = {
  idea: { label: 'Idea', color: 'text-slate-400 bg-slate-500/10 border-slate-500/25', dot: 'bg-slate-400' },
  aprobada: { label: 'Aprobada', color: 'text-teal-400 bg-teal-500/10 border-teal-500/25', dot: 'bg-teal-400' },
  en_produccion: { label: 'En producción', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25', dot: 'bg-blue-400' },
  activa: { label: 'Activa', color: 'text-green-400 bg-green-500/10 border-green-500/25', dot: 'bg-green-400' },
  pausada: { label: 'Pausada', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-400' },
}

const PLATFORM_CONFIG = {
  meta: { label: 'Meta Ads', icon: <Facebook size={13} />, color: 'text-meta-blue-light bg-meta-blue/10 border-meta-blue/25' },
  google: { label: 'Google Ads', icon: <Search size={13} />, color: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  ambos: { label: 'Meta + Google', icon: <Lightbulb size={13} />, color: 'text-brand-purple bg-brand-purple/10 border-brand-purple/25' },
}

const EMPTY: Omit<CampaignIdea, 'id' | 'createdAt'> = {
  title: '', platform: 'meta', objective: '', description: '', budget: '',
  startDate: '', status: 'idea', tags: [], brand: '',
}

interface Props { brand: Brand }

export function CampaignIdeas({ brand }: Props) {
  const [ideas, setIdeas] = useLocalStorage<CampaignIdea[]>('paid_campaign_ideas', [])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY, brand: brand.label })
  const [filterPlatform, setFilterPlatform] = useState<'todas' | 'meta' | 'google' | 'ambos'>('todas')
  const [filterStatus, setFilterStatus] = useState<'todas' | keyof typeof STATUS_CONFIG>('todas')

  const brandIdeas = ideas.filter(i => i.brand === brand.label)
  const filtered = brandIdeas
    .filter(i => filterPlatform === 'todas' || i.platform === filterPlatform)
    .filter(i => filterStatus === 'todas' || i.status === filterStatus)

  // Group by status
  const upcoming = filtered.filter(i => ['idea', 'aprobada', 'en_produccion'].includes(i.status))
  const active = filtered.filter(i => ['activa', 'pausada'].includes(i.status))

  function save() {
    if (!form.title.trim()) return
    if (editingId) setIdeas(prev => prev.map(i => i.id === editingId ? { ...i, ...form } : i))
    else setIdeas(prev => [...prev, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }])
    setShowForm(false)
  }

  function openEdit(idea: CampaignIdea) {
    setForm({ title: idea.title, platform: idea.platform, objective: idea.objective, description: idea.description, budget: idea.budget || '', startDate: idea.startDate || '', status: idea.status, tags: idea.tags, brand: idea.brand })
    setEditingId(idea.id)
    setShowForm(true)
  }

  function IdeaCard({ idea }: { idea: CampaignIdea }) {
    const sc = STATUS_CONFIG[idea.status]
    const pc = PLATFORM_CONFIG[idea.platform]
    return (
      <div className="bg-bg-card border border-bg-border rounded-xl p-4 hover:border-brand-orange/20 transition-all card-hover group">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex-1 leading-snug">{idea.title}</h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(idea)} className="p-1 rounded hover:bg-bg-elevated text-slate-500 hover:text-slate-300"><Edit2 size={12} /></button>
            <button onClick={() => setIdeas(prev => prev.filter(i => i.id !== idea.id))} className="p-1 rounded hover:bg-bg-elevated text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`badge border ${pc.color} flex items-center gap-1`}>{pc.icon}{pc.label}</span>
          <select value={idea.status} onChange={e => setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: e.target.value as any } : i))} className={`badge border cursor-pointer bg-transparent ${sc.color}`}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        {idea.objective && <p className="text-xs text-slate-500 mb-2"><span className="text-slate-400 font-medium">Objetivo:</span> {idea.objective}</p>}
        {idea.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{idea.description}</p>}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-bg-border mt-3">
          {idea.budget && <span>💰 {idea.budget}</span>}
          {idea.startDate && <span>📅 {new Date(idea.startDate).toLocaleDateString('es-AR')}</span>}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Filters + Add */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {(['todas', 'meta', 'google', 'ambos'] as const).map(p => (
            <button key={p} onClick={() => setFilterPlatform(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterPlatform === p ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/25' : 'text-slate-400 hover:text-slate-200 bg-bg-card border border-bg-border'}`}>
              {p === 'todas' ? 'Todas' : PLATFORM_CONFIG[p]?.label}
            </button>
          ))}
          <div className="w-px h-4 bg-bg-border mx-1" />
          {(['todas', 'idea', 'aprobada', 'activa', 'pausada'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filterStatus === s ? 'bg-bg-elevated text-white border border-bg-border' : 'text-slate-500 hover:text-slate-300'}`}>
              {s === 'todas' ? 'Todas' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
        <button onClick={() => { setForm({ ...EMPTY, brand: brand.label }); setEditingId(null); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-orange/80 hover:bg-brand-orange rounded-lg text-sm font-medium text-white transition-colors">
          <Plus size={14} /> Nueva campaña
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-bg-card border border-bg-border rounded-xl p-12 text-center">
          <Lightbulb size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin campañas todavía</p>
          <p className="text-slate-600 text-sm mt-1">Planificá las próximas campañas de paid media</p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Campañas activas / pausadas
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {active.map(i => <IdeaCard key={i.id} idea={i} />)}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" /> Próximas / Ideas
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {upcoming.map(i => <IdeaCard key={i.id} idea={i} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated border border-bg-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h2 className="text-base font-semibold text-white">{editingId ? 'Editar campaña' : 'Nueva campaña'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Nombre *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nombre de la campaña" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Plataforma</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as any }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    <option value="meta">Meta Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="ambos">Meta + Google</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Objetivo</label>
                <input value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} placeholder="Conversaciones WA, leads, ventas..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Detalles, audiencia, creatividades..." className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Presupuesto estimado</label>
                  <input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="USD 500 / mes" className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Fecha inicio</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-200" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-bg-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-bg-card border border-bg-border transition-colors">Cancelar</button>
              <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-orange/80 hover:bg-brand-orange text-white transition-colors">{editingId ? 'Guardar' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
