'use client'
import { useState, useEffect } from 'react'
import { Plus, X, Video, CheckCircle2, Circle, ExternalLink } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
type VideoStatus = 'pendiente' | 'en_produccion' | 'publicado'
type VideoPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'otro'

interface VideoPauta {
  id: string
  title: string
  platform: VideoPlatform
  format: string
  brand: string
  responsible: string
  status: VideoStatus
  enPauta: boolean
  fechaPauta: string
  postUrl: string
  notes: string
  createdAt: string
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<VideoStatus, string> = {
  pendiente: 'Pendiente',
  en_produccion: 'En producción',
  publicado: 'Publicado',
}

const STATUS_COLORS: Record<VideoStatus, string> = {
  pendiente: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
  en_produccion: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  publicado: 'text-green-400 bg-green-500/10 border-green-500/25',
}

const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  otro: 'Otro',
}

const SAMPLE_VIDEOS: VideoPauta[] = [
  {
    id: '1', title: 'Reel producto 377 - Copia 2', platform: 'instagram', format: 'Reel',
    brand: 'Simet', responsible: 'Belén', status: 'publicado', enPauta: true,
    fechaPauta: '2026-05-15', postUrl: '', notes: 'Top performer en WA',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2', title: 'Video Belu #1 (35% OFF)', platform: 'facebook', format: 'Video',
    brand: 'Simet', responsible: 'Belén', status: 'publicado', enPauta: true,
    fechaPauta: '2026-04-20', postUrl: '', notes: 'Campaña 35% off',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3', title: 'Reel melamina junio', platform: 'instagram', format: 'Reel',
    brand: 'Simet', responsible: 'Marina', status: 'en_produccion', enPauta: false,
    fechaPauta: '', postUrl: '', notes: '',
    createdAt: new Date().toISOString(),
  },
]

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyVideo = (): Omit<VideoPauta, 'id' | 'createdAt'> => ({
  title: '', platform: 'instagram', format: 'Reel', brand: 'Simet',
  responsible: '', status: 'pendiente', enPauta: false, fechaPauta: '',
  postUrl: '', notes: '',
})

// ─── Main Component ───────────────────────────────────────────────────────────
export function VideosPauta() {
  const [videos, setVideos] = useState<VideoPauta[]>(() => {
    if (typeof window === 'undefined') return SAMPLE_VIDEOS
    try {
      const stored = localStorage.getItem('videos_pauta')
      return stored ? JSON.parse(stored) : SAMPLE_VIDEOS
    } catch { return SAMPLE_VIDEOS }
  })

  const [showForm, setShowForm] = useState(false)
  const [editVideo, setEditVideo] = useState<VideoPauta | null>(null)
  const [form, setForm] = useState(emptyVideo())
  const [filterStatus, setFilterStatus] = useState<VideoStatus | 'todos'>('todos')
  const [filterPlatform, setFilterPlatform] = useState<VideoPlatform | 'todos'>('todos')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('videos_pauta', JSON.stringify(videos))
    }
  }, [videos])

  function openAdd() {
    setEditVideo(null)
    setForm(emptyVideo())
    setShowForm(true)
  }

  function openEdit(video: VideoPauta) {
    setEditVideo(video)
    setForm({ title: video.title, platform: video.platform, format: video.format,
      brand: video.brand, responsible: video.responsible, status: video.status,
      enPauta: video.enPauta, fechaPauta: video.fechaPauta, postUrl: video.postUrl,
      notes: video.notes })
    setShowForm(true)
  }

  function saveVideo() {
    if (!form.title.trim()) return
    if (editVideo) {
      setVideos(prev => prev.map(v => v.id === editVideo.id ? { ...v, ...form } : v))
    } else {
      const newVideo: VideoPauta = { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }
      setVideos(prev => [...prev, newVideo])
    }
    setShowForm(false)
  }

  function deleteVideo(id: string) {
    setVideos(prev => prev.filter(v => v.id !== id))
    setShowForm(false)
  }

  function togglePauta(id: string) {
    setVideos(prev => prev.map(v => v.id === id ? {
      ...v,
      enPauta: !v.enPauta,
      fechaPauta: !v.enPauta ? new Date().toISOString().slice(0, 10) : v.fechaPauta,
    } : v))
  }

  const filtered = videos.filter(v => {
    if (filterStatus !== 'todos' && v.status !== filterStatus) return false
    if (filterPlatform !== 'todos' && v.platform !== filterPlatform) return false
    return true
  })

  const enPautaCount = videos.filter(v => v.enPauta).length

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 size={13} className="text-green-400" />
            <span className="text-sm font-bold text-green-400">{enPautaCount}</span>
            <span className="text-xs text-slate-500">en pauta</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-bg-border">
            <Video size={13} className="text-slate-500" />
            <span className="text-sm font-bold text-white">{videos.length}</span>
            <span className="text-xs text-slate-500">videos totales</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filters */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as VideoStatus | 'todos')}
            className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg text-xs text-slate-300 outline-none"
          >
            <option value="todos">Todos los estados</option>
            {(Object.keys(STATUS_LABELS) as VideoStatus[]).map(k => (
              <option key={k} value={k}>{STATUS_LABELS[k]}</option>
            ))}
          </select>
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value as VideoPlatform | 'todos')}
            className="px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg text-xs text-slate-300 outline-none"
          >
            <option value="todos">Todas las plataformas</option>
            {(Object.keys(PLATFORM_LABELS) as VideoPlatform[]).map(k => (
              <option key={k} value={k}>{PLATFORM_LABELS[k]}</option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand-purple/15 border border-brand-purple/30 hover:bg-brand-purple/25 text-brand-purple rounded-lg text-sm font-medium transition-all"
          >
            <Plus size={14} /> Agregar video
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {['Título', 'Plataforma', 'Formato', 'Responsable', 'Estado', 'En Pauta', 'Fecha Pauta', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(video => (
                <tr key={video.id} className="border-b border-bg-border last:border-0 hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-200 max-w-[180px] truncate" title={video.title}>{video.title}</div>
                    {video.notes && <div className="text-xs text-slate-600 truncate max-w-[180px] mt-0.5">{video.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{PLATFORM_LABELS[video.platform]}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{video.format}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{video.responsible || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${STATUS_COLORS[video.status]}`}>
                      {STATUS_LABELS[video.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePauta(video.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        video.enPauta
                          ? 'text-green-400 hover:text-green-300'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {video.enPauta ? (
                        <><CheckCircle2 size={14} /> Corriendo</>
                      ) : (
                        <><Circle size={14} /> No</>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {video.fechaPauta
                      ? new Date(video.fechaPauta + 'T00:00:00').toLocaleDateString('es-AR')
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(video)}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Editar
                      </button>
                      {video.postUrl && (
                        <a href={video.postUrl} target="_blank" rel="noopener noreferrer"
                          className="text-slate-600 hover:text-brand-teal transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-600 text-sm">
                    Sin videos para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-bg-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
              <h3 className="text-sm font-semibold text-white">{editVideo ? 'Editar video' : 'Nuevo video'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-bg-elevated text-slate-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Título *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nombre del video"
                  className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-brand-purple/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Plataforma</label>
                  <select
                    value={form.platform}
                    onChange={e => setForm(f => ({ ...f, platform: e.target.value as VideoPlatform }))}
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 outline-none"
                  >
                    {(Object.keys(PLATFORM_LABELS) as VideoPlatform[]).map(k => (
                      <option key={k} value={k}>{PLATFORM_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Formato</label>
                  <input
                    value={form.format}
                    onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                    placeholder="Reel, Video, Story..."
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Responsable</label>
                  <input
                    value={form.responsible}
                    onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
                    placeholder="Nombre"
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Estado</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as VideoStatus }))}
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 outline-none"
                  >
                    {(Object.keys(STATUS_LABELS) as VideoStatus[]).map(k => (
                      <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Fecha en pauta</label>
                  <input
                    type="date"
                    value={form.fechaPauta}
                    onChange={e => setForm(f => ({ ...f, fechaPauta: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 outline-none"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm(f => ({ ...f, enPauta: !f.enPauta }))}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${form.enPauta ? 'bg-green-500' : 'bg-slate-600'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${form.enPauta ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs text-slate-400">En pauta</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">URL del post</label>
                <input
                  value={form.postUrl}
                  onChange={e => setForm(f => ({ ...f, postUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Notas</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observaciones..."
                  className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-bg-border">
              {editVideo ? (
                <button onClick={() => deleteVideo(editVideo.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Eliminar
                </button>
              ) : <div />}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={saveVideo}
                  disabled={!form.title.trim()}
                  className="px-4 py-2 bg-brand-purple/15 border border-brand-purple/30 hover:bg-brand-purple/25 text-brand-purple rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {editVideo ? 'Guardar cambios' : 'Crear video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
