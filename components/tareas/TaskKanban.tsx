'use client'
import { useState, useEffect } from 'react'
import { Plus, X, ChevronDown, AlertCircle, Clock, User } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Priority = 'alta' | 'media' | 'baja'
type TaskStatus = 'por_hacer' | 'en_proceso' | 'revision' | 'hecho'

interface Task {
  id: string
  title: string
  responsible: string
  deadline: string
  description: string
  priority: Priority
  status: TaskStatus
  brand: string
  tags: string[]
  createdAt: string
}

// ─── Constants ───────────────────────────────────────────────────────────────
const COLUMNS: { key: TaskStatus; label: string; color: string; bg: string; border: string }[] = [
  { key: 'por_hacer', label: 'Por hacer', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  { key: 'en_proceso', label: 'En proceso', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'revision', label: 'En revisión', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'hecho', label: 'Hecho', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
]

const PRIORITY_COLORS: Record<Priority, string> = {
  alta: 'text-red-400 bg-red-500/10 border-red-500/25',
  media: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  baja: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  por_hacer: 'Por hacer',
  en_proceso: 'En proceso',
  revision: 'En revisión',
  hecho: 'Hecho',
}

const SAMPLE_TASKS: Task[] = [
  {
    id: '1', title: 'Crear brief campañas junio', responsible: 'Carolina', deadline: '2026-06-10',
    description: 'Armar briefs para Meta Ads y Google de junio', priority: 'alta',
    status: 'por_hacer', brand: 'Simet', tags: ['paid', 'brief'], createdAt: new Date().toISOString(),
  },
  {
    id: '2', title: 'Editar Reel producto 377', responsible: 'Belén', deadline: '2026-06-08',
    description: 'Edición final y subtítulos', priority: 'alta',
    status: 'en_proceso', brand: 'Simet', tags: ['reel', 'edicion'], createdAt: new Date().toISOString(),
  },
  {
    id: '3', title: 'Revisar copy para stories', responsible: 'Marina', deadline: '2026-06-12',
    description: 'Revisión de textos para stories de la semana', priority: 'media',
    status: 'revision', brand: 'Simet', tags: ['copy', 'stories'], createdAt: new Date().toISOString(),
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isOverdue(deadline: string) {
  if (!deadline) return false
  return new Date(deadline) < new Date(new Date().toDateString())
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyTask = (): Omit<Task, 'id' | 'createdAt'> => ({
  title: '', responsible: '', deadline: '', description: '',
  priority: 'media', status: 'por_hacer', brand: 'Simet', tags: [],
})

// ─── Main Component ───────────────────────────────────────────────────────────
export function TaskKanban() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return SAMPLE_TASKS
    try {
      const stored = localStorage.getItem('tasks_kanban')
      return stored ? JSON.parse(stored) : SAMPLE_TASKS
    } catch { return SAMPLE_TASKS }
  })

  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState(emptyTask())

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks_kanban', JSON.stringify(tasks))
    }
  }, [tasks])

  function openAdd(defaultStatus?: TaskStatus) {
    setEditTask(null)
    setForm({ ...emptyTask(), status: defaultStatus || 'por_hacer' })
    setShowForm(true)
  }

  function openEdit(task: Task) {
    setEditTask(task)
    setForm({ title: task.title, responsible: task.responsible, deadline: task.deadline,
      description: task.description, priority: task.priority, status: task.status,
      brand: task.brand, tags: task.tags })
    setShowForm(true)
  }

  function saveTask() {
    if (!form.title.trim()) return
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...form } : t))
    } else {
      const newTask: Task = { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }
      setTasks(prev => [...prev, newTask])
    }
    setShowForm(false)
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    setShowForm(false)
  }

  function moveTask(id: string, newStatus: TaskStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  // Stats
  const today = new Date().toDateString()
  const overdueCount = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date(today) && t.status !== 'hecho').length
  const totalByStatus = COLUMNS.map(c => ({ ...c, count: tasks.filter(t => t.status === c.key).length }))

  return (
    <div>
      {/* Stats row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-6 flex-1">
          {totalByStatus.map(col => (
            <div key={col.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${col.bg} ${col.border}`}>
              <span className={`text-lg font-bold ${col.color}`}>{col.count}</span>
              <span className="text-xs text-slate-500">{col.label}</span>
            </div>
          ))}
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-red-500/10 border-red-500/25">
              <AlertCircle size={13} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">{overdueCount}</span>
              <span className="text-xs text-slate-500">vencida{overdueCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green/15 border border-brand-green/30 hover:bg-brand-green/25 text-brand-green rounded-lg text-sm font-medium transition-all"
        >
          <Plus size={15} /> Agregar tarea
        </button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} className="flex flex-col">
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b-0 border ${col.bg} ${col.border} rounded-xl mb-2`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${col.bg} ${col.color} font-medium`}>{colTasks.length}</span>
                </div>
                <button
                  onClick={() => openAdd(col.key)}
                  className="p-1 rounded-lg hover:bg-bg-elevated text-slate-600 hover:text-slate-400 transition-colors"
                  title="Agregar tarea"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Task cards */}
              <div className="space-y-2 min-h-[200px]">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => openEdit(task)}
                    onMove={(status) => moveTask(task.id, status)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="border border-dashed border-bg-border rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-600">Sin tareas</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-bg-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
              <h3 className="text-sm font-semibold text-white">{editTask ? 'Editar tarea' : 'Nueva tarea'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-bg-elevated text-slate-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Título *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Editar reel producto..."
                  className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-brand-green/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Responsable</label>
                  <input
                    value={form.responsible}
                    onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
                    placeholder="Nombre"
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-brand-green/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Vencimiento</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 outline-none focus:border-brand-green/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detalles de la tarea..."
                  rows={2}
                  className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-brand-green/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Prioridad</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 outline-none focus:border-brand-green/50"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Estado</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                    className="w-full px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-slate-200 outline-none focus:border-brand-green/50"
                  >
                    {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-bg-border">
              {editTask ? (
                <button
                  onClick={() => deleteTask(editTask.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Eliminar tarea
                </button>
              ) : <div />}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTask}
                  disabled={!form.title.trim()}
                  className="px-4 py-2 bg-brand-green/15 border border-brand-green/30 hover:bg-brand-green/25 text-brand-green rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {editTask ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onMove }: {
  task: Task
  onEdit: () => void
  onMove: (status: TaskStatus) => void
}) {
  const overdue = isOverdue(task.deadline) && task.status !== 'hecho'

  return (
    <div
      className="bg-bg-card border border-bg-border rounded-xl p-3 hover:border-slate-600 transition-all cursor-pointer group"
      onClick={onEdit}
    >
      {/* Priority + title */}
      <div className="flex items-start gap-2 mb-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <p className="text-sm font-medium text-slate-200 leading-snug">{task.title}</p>
      </div>

      {/* Responsible + deadline */}
      <div className="flex items-center justify-between mt-3">
        {task.responsible ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center">
              <span className="text-[8px] font-bold text-brand-purple">{getInitials(task.responsible)}</span>
            </div>
            <span className="text-xs text-slate-500">{task.responsible}</span>
          </div>
        ) : <div />}
        {task.deadline && (
          <div className={`flex items-center gap-1 text-[10px] ${overdue ? 'text-red-400' : 'text-slate-600'}`}>
            <Clock size={10} />
            {overdue ? 'Vencida' : new Date(task.deadline + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
          </div>
        )}
      </div>

      {/* Move status selector */}
      <div
        className="mt-2 pt-2 border-t border-bg-border"
        onClick={e => e.stopPropagation()}
      >
        <select
          value={task.status}
          onChange={e => onMove(e.target.value as TaskStatus)}
          className="w-full px-2 py-1 bg-bg-elevated border border-bg-border rounded-lg text-xs text-slate-400 outline-none"
        >
          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>
    </div>
  )
}
