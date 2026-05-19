import { useState, useEffect, useCallback } from 'react'
import { MdClose, MdAdd, MdDelete, MdSave, MdEdit, MdExpandMore, MdExpandLess } from 'react-icons/md'

function emptyLesson() {
  return {
    id: `l-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: '', duration: 15, content: '', xpReward: 20,
    videoUrl: '', resources: [],
    quiz: { questions: [{ id: `q-${Date.now()}`, question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }] },
  }
}

function emptyModule() {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: '', order: 1, description: '', xpReward: 100, lessons: [emptyLesson()],
  }
}

const DEFAULT_COURSE = {
  title: '', slug: '', courseId: '', category: 'Budgeting', difficulty: 'Beginner',
  description: '', thumbnail: '', instructor: 'FinanceQuest Team',
  duration: 0, rating: 5, totalEnrollments: 0, isPublished: true,
  modules: [], prerequisites: [],
}

const inputCls = (err) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 ${
    err ? 'border-red-500/60' : 'border-slate-700'
  }`

const labelCls = 'block text-xs text-slate-400 mb-1'

function normalizeModule(m) {
  return {
    id: m.id || m._id || `m-${Date.now()}`,
    title: m.title || '', order: m.order ?? 1,
    description: m.description || '', xpReward: m.xpReward ?? 100,
    lessons: (m.lessons || []).map(l => ({
      id: l.id || l._id || `l-${Date.now()}`,
      title: l.title || '', duration: l.duration ?? 15,
      content: l.content || '', xpReward: l.xpReward ?? 20,
      videoUrl: l.videoUrl || '', resources: l.resources || [],
      quiz: l.quiz || emptyLesson().quiz,
    })),
  }
}

export default function CourseModal({ open, onClose, onSave, initial }) {
  const [course,    setCourse]    = useState({ ...DEFAULT_COURSE, modules: [emptyModule()] })
  const [errors,    setErrors]    = useState({})
  const [saving,    setSaving]    = useState(false)
  const [expanded,  setExpanded]  = useState({}) // module id → boolean

  useEffect(() => {
    if (!open) return
    if (initial) {
      const modules = (initial.modules || []).map(normalizeModule)
      setCourse({ ...DEFAULT_COURSE, ...initial, modules })
      // Expand first module by default
      if (modules.length) setExpanded({ [modules[0].id]: true })
    } else {
      const m = emptyModule()
      setCourse({ ...DEFAULT_COURSE, modules: [m] })
      setExpanded({ [m.id]: true })
    }
    setErrors({})
    setSaving(false)
  }, [initial, open])

  function validate() {
    const e = {}
    if (!course.title.trim())       e.title       = 'Title is required'
    if (!course.slug.trim())        e.slug        = 'Slug is required'
    if (!course.description.trim()) e.description = 'Description is required'
    if (!course.modules.length)                                                      e.modules = 'At least one module is required'
    else if (course.modules.some(m => !m.title.trim()))                              e.modules = 'All modules need a title'
    else if (course.modules.some(m => !m.lessons.length))                            e.modules = 'Each module needs at least one lesson'
    else if (course.modules.some(m => m.lessons.some(l => !l.title.trim())))         e.modules = 'All lessons need a title'
    else if (course.modules.some(m => m.lessons.some(l => !l.content.trim())))       e.modules = 'All lessons need content'
    setErrors(e)
    return !Object.keys(e).length
  }

  const set = useCallback((patch) => setCourse(s => ({ ...s, ...patch })), [])
  const clearError = (key) => setErrors(e => ({ ...e, [key]: undefined }))

  const addModule    = () => { const m = emptyModule(); set({ modules: [...course.modules, m] }); setExpanded(x => ({ ...x, [m.id]: true })) }
  const removeModule = (id) => set({ modules: course.modules.filter(m => m.id !== id) })
  const updateModule = (id, patch) => set({ modules: course.modules.map(m => m.id === id ? { ...m, ...patch } : m) })
  const addLesson    = (mid) => set({ modules: course.modules.map(m => m.id === mid ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m) })
  const removeLesson = (mid, lid) => set({ modules: course.modules.map(m => m.id === mid ? { ...m, lessons: m.lessons.filter(l => l.id !== lid) } : m) })
  const updateLesson = (mid, lid, patch) => set({ modules: course.modules.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, ...patch } : l) } : m) })

  // BUG FIX: don't call onClose inside handleSave — let parent decide
  // If onSave throws, the modal stays open and shows the error
  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({ ...course, _id: initial?._id, id: initial?.id })
      // onClose is called by the parent (Courses.js) on success
    } catch (err) {
      setErrors(e => ({ ...e, _api: err.message || 'Save failed. Please try again.' }))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose() }}
    >
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-5xl my-6 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <MdEdit className="text-blue-400 text-xl" />
            <h3 className="text-base font-medium text-slate-100">{initial ? 'Edit Course' : 'Add Course'}</h3>
          </div>
          <button onClick={onClose} disabled={saving} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-40" aria-label="Close">
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* API error banner */}
          {errors._api && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/60 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{errors._api}</p>
            </div>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input value={course.title} onChange={e => { set({ title: e.target.value }); clearError('title') }}
                placeholder="Course title" className={inputCls(errors.title)} />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input value={course.slug} onChange={e => { set({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }); clearError('slug') }}
                placeholder="course-slug" className={inputCls(errors.slug)} />
              {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select value={course.category} onChange={e => set({ category: e.target.value })} className={inputCls(false)}>
                {['Savings', 'Investing', 'Budgeting', 'Debt', 'Retirement', 'Tax'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select value={course.difficulty} onChange={e => set({ difficulty: e.target.value })} className={inputCls(false)}>
                {['Beginner', 'Intermediate', 'Advanced'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea value={course.description} onChange={e => { set({ description: e.target.value }); clearError('description') }}
              placeholder="Course description" rows={3} className={inputCls(errors.description)} />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Instructor</label>
              <input value={course.instructor} onChange={e => set({ instructor: e.target.value })}
                placeholder="Instructor name" className={inputCls(false)} />
            </div>
            <div>
              <label className={labelCls}>Thumbnail URL</label>
              <input value={course.thumbnail} onChange={e => set({ thumbnail: e.target.value })}
                placeholder="https://..." className={inputCls(false)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Rating (0–5)</label>
              <input type="number" min="0" max="5" step="0.1" value={course.rating}
                onChange={e => set({ rating: parseFloat(e.target.value) || 0 })} className={inputCls(false)} />
            </div>
            <div>
              <label className={labelCls}>Duration (min)</label>
              <input type="number" min="0" value={course.duration}
                onChange={e => set({ duration: parseInt(e.target.value) || 0 })} className={inputCls(false)} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer h-[38px]">
                <input type="checkbox" checked={course.isPublished} onChange={e => set({ isPublished: e.target.checked })} className="rounded accent-emerald-500" />
                <span className={`text-sm ${course.isPublished ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>
          </div>

          {/* Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-200">
                Modules *
                <span className="ml-2 text-xs font-normal text-slate-500">({course.modules.length})</span>
              </label>
              <button onClick={addModule} className="flex items-center gap-1 text-xs bg-emerald-700/60 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors">
                <MdAdd /> Add Module
              </button>
            </div>
            {errors.modules && <p className="text-xs text-red-400 mb-2">{errors.modules}</p>}

            <div className="space-y-3">
              {course.modules.map((m, mi) => (
                <div key={m.id} className="border border-slate-700/60 rounded-xl overflow-hidden">
                  {/* Module header / collapse toggle */}
                  <div
                    className="flex items-center gap-2 p-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800/80 transition-colors"
                    onClick={() => setExpanded(x => ({ ...x, [m.id]: !x[m.id] }))}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(x => ({ ...x, [m.id]: !x[m.id] })) }}
                      className="text-slate-400 shrink-0"
                      aria-label={expanded[m.id] ? 'Collapse' : 'Expand'}
                    >
                      {expanded[m.id] ? <MdExpandLess /> : <MdExpandMore />}
                    </button>
                    <span className="text-xs text-slate-500 shrink-0">Module {mi + 1}</span>
                    <span className="flex-1 text-sm text-slate-200 font-medium truncate">{m.title || 'Untitled module'}</span>
                    <span className="text-xs text-slate-500 shrink-0">{m.lessons.length} lesson{m.lessons.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={e => { e.stopPropagation(); removeModule(m.id) }}
                      disabled={course.modules.length === 1}
                      className="flex items-center text-xs bg-red-900/50 hover:bg-red-700 disabled:opacity-30 p-1.5 rounded-lg transition-colors shrink-0"
                      aria-label="Delete module"
                    >
                      <MdDelete />
                    </button>
                  </div>

                  {/* Module body */}
                  {expanded[m.id] && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <input value={m.title} onChange={e => updateModule(m.id, { title: e.target.value })}
                          placeholder="Module title" className={`${inputCls(false)} flex-1`} onClick={e => e.stopPropagation()} />
                        <div className="shrink-0">
                          <label className="text-xs text-slate-500 block mb-1">Order</label>
                          <input type="number" value={m.order} onChange={e => updateModule(m.id, { order: parseInt(e.target.value) || 1 })}
                            className={`${inputCls(false)} w-16 text-center`} />
                        </div>
                        <div className="shrink-0">
                          <label className="text-xs text-slate-500 block mb-1">XP</label>
                          <input type="number" value={m.xpReward} onChange={e => updateModule(m.id, { xpReward: parseInt(e.target.value) || 0 })}
                            className={`${inputCls(false)} w-20 text-center`} />
                        </div>
                      </div>
                      <textarea value={m.description} onChange={e => updateModule(m.id, { description: e.target.value })}
                        placeholder="Module description (optional)" rows={2} className={inputCls(false)} />

                      {/* Lessons */}
                      <div className="ml-3 border-l-2 border-slate-700 pl-3 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">Lessons</span>
                          <button onClick={() => addLesson(m.id)} className="flex items-center gap-1 text-xs bg-indigo-700/60 hover:bg-indigo-600 px-2.5 py-1.5 rounded-lg transition-colors">
                            <MdAdd /> Add Lesson
                          </button>
                        </div>
                        {m.lessons.map((l, li) => (
                          <div key={l.id} className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 shrink-0">#{li + 1}</span>
                              <input value={l.title} onChange={e => updateLesson(m.id, l.id, { title: e.target.value })}
                                placeholder="Lesson title" className={`${inputCls(false)} flex-1 text-xs`} />
                              <input type="number" min="1" value={l.duration} onChange={e => updateLesson(m.id, l.id, { duration: parseInt(e.target.value) || 1 })}
                                placeholder="Mins" title="Duration in minutes" className={`${inputCls(false)} w-14 text-center text-xs`} />
                              <input type="number" min="0" value={l.xpReward} onChange={e => updateLesson(m.id, l.id, { xpReward: parseInt(e.target.value) || 0 })}
                                placeholder="XP" title="XP reward" className={`${inputCls(false)} w-14 text-center text-xs`} />
                              <button onClick={() => removeLesson(m.id, l.id)} disabled={m.lessons.length === 1}
                                className="flex items-center text-xs bg-red-900/50 hover:bg-red-700 disabled:opacity-30 p-1.5 rounded-lg transition-colors shrink-0">
                                <MdClose />
                              </button>
                            </div>
                            <textarea value={l.content} onChange={e => updateLesson(m.id, l.id, { content: e.target.value })}
                              placeholder="Lesson content *" rows={2} className={`${inputCls(false)} text-xs`} />
                            <input value={l.videoUrl} onChange={e => updateLesson(m.id, l.id, { videoUrl: e.target.value })}
                              placeholder="Video URL (optional)" className={`${inputCls(false)} text-xs`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl sticky bottom-0">
          <p className="text-xs text-slate-500">* Required fields</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {saving
                ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <MdSave className="text-base" />
              }
              {saving ? 'Saving…' : initial ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}