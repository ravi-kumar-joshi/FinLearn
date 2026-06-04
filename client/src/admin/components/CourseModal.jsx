
import React, { useState, useEffect, useCallback } from 'react'
import { MdClose, MdAdd, MdSave, MdEdit } from 'react-icons/md'
import LessonEditor from './LessonEditor'

function makeId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const DEFAULT = {
  title: '', slug: '', category: 'Budgeting', difficulty: 'Beginner',
  description: '', thumbnail: '', instructor: 'FinanceQuest Team',
  duration: 0, rating: 5, isPublished: true, modules: [],
}

const inputCls = (err) =>
  `w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 ${err ? 'border-red-500/60' : 'border-slate-700'}`

const labelCls = 'block text-xs text-slate-400 mb-1'

function normalize(initial) {
  if (!initial) return null
  return {
    ...initial,
    modules: (initial.modules || []).map(m => ({
      id: m.id || m._id || makeId('m'),
      title: m.title || '', description: m.description || '', order: m.order ?? 1, xpReward: m.xpReward ?? 100,
      lessons: (m.lessons || []).map(l => ({ id: l.id || l._id || makeId('l'), title: l.title || '', duration: l.duration ?? 15, content: l.content || '', xpReward: l.xpReward ?? 20, videoUrl: l.videoUrl || '' }))
    }))
  }
}

export default function CourseModal({ open, onClose, onSave, initial }) {
  const [tab, setTab] = useState('general')
  const [course, setCourse] = useState({ ...DEFAULT, modules: [{ id: makeId('m'), title: '', lessons: [{ id: makeId('l'), title: '', content: '' }] }] })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      const n = normalize(initial)
      setCourse({ ...DEFAULT, ...n })
    } else {
      setCourse({ ...DEFAULT, modules: [{ id: makeId('m'), title: '', lessons: [{ id: makeId('l'), title: '', content: '' }] }] })
    }
    setErrors({})
    setSaving(false)
    setTab('general')
  }, [open, initial])

  const setPatch = useCallback((patch) => setCourse(c => ({ ...c, ...patch })), [])

  function validate() {
    const e = {}
    if (!course.title || !course.title.trim()) e.title = 'Title required'
    if (!course.slug || !course.slug.trim()) e.slug = 'Slug required'
    if (!course.description || !course.description.trim()) e.description = 'Description required'
    if (!course.modules || !course.modules.length) e.modules = 'Add at least one module'
    else if (course.modules.some(m => !m.title || !m.title.trim())) e.modules = 'All modules need a title'
    else if (course.modules.some(m => !m.lessons || !m.lessons.length)) e.modules = 'Each module needs at least one lesson'
    setErrors(e)
    return !Object.keys(e).length
  }

  const addModule = () => setCourse(c => ({ ...c, modules: [...c.modules, { id: makeId('m'), title: '', order: c.modules.length + 1, description: '', xpReward: 100, lessons: [{ id: makeId('l'), title: '', content: '' }] }] }))
  const removeModule = (mid) => setCourse(c => ({ ...c, modules: c.modules.filter(m => m.id !== mid) }))
  const updateModule = (mid, patch) => setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mid ? { ...m, ...patch } : m) }))

  const addLesson = (mid) => setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mid ? { ...m, lessons: [...m.lessons, { id: makeId('l'), title: '', content: '' }] } : m) }))
  const removeLesson = (mid, lid) => setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mid ? { ...m, lessons: m.lessons.filter(l => l.id !== lid) } : m) }))
  const updateLesson = (mid, lid, patch) => setCourse(c => ({ ...c, modules: c.modules.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, ...patch } : l) } : m) }))

  async function handleSave() {
    if (!validate()) { setTab('general'); return }
    setSaving(true)
    try {
      // Ensure every module and lesson has an `order` field required by the backend
      const prepared = {
        ...course,
        modules: (course.modules || []).map((m, mi) => ({
          ...m,
          order: (m.order !== undefined && m.order !== null) ? m.order : (mi + 1),
          lessons: (m.lessons || []).map((l, li) => ({ ...(l || {}), order: (l?.order !== undefined && l?.order !== null) ? l.order : (li + 1) }))
        }))
      }
      console.log('[CourseModal] prepared payload before save:', prepared)
      await onSave({ ...prepared, _id: initial?._id, id: initial?.id })
      // parent handles closing and refresh; we simply stop the spinner here
    } catch (err) {
      setErrors(e => ({ ...e, _api: err.message || 'Save failed' }))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose() }}>
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-5xl my-6 shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <MdEdit className="text-blue-400 text-xl" />
            <h3 className="text-base font-medium text-slate-100">{initial ? 'Edit Course' : 'Add Course'}</h3>
          </div>
          <button onClick={onClose} disabled={saving} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-40" aria-label="Close">
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {errors._api && <div className="mb-3 p-3 bg-red-900/20 border border-red-800/60 rounded">{errors._api}</div>}

          {/* Tabs */}
          <div className="mb-4 border-b border-slate-800">
            <nav className="flex gap-2">
              <button onClick={() => setTab('general')} className={`px-3 py-2 text-sm ${tab === 'general' ? 'bg-slate-800 text-slate-100 rounded-md' : 'text-slate-400'}`}>General</button>
              <button onClick={() => setTab('modules')} className={`px-3 py-2 text-sm ${tab === 'modules' ? 'bg-slate-800 text-slate-100 rounded-md' : 'text-slate-400'}`}>Modules</button>
            </nav>
          </div>

          {tab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input value={course.title} onChange={e => setPatch({ title: e.target.value })} placeholder="Course title" className={inputCls(errors.title)} />
                  {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className={labelCls}>Slug *</label>
                  <input value={course.slug} onChange={e => setPatch({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} placeholder="course-slug" className={inputCls(errors.slug)} />
                  {errors.slug && <p className="text-xs text-red-400 mt-1">{errors.slug}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea value={course.description} onChange={e => setPatch({ description: e.target.value })} rows={3} className={inputCls(errors.description)} />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Instructor</label>
                  <input value={course.instructor} onChange={e => setPatch({ instructor: e.target.value })} className={inputCls(false)} />
                </div>
                <div>
                  <label className={labelCls}>Thumbnail URL</label>
                  <input value={course.thumbnail} onChange={e => setPatch({ thumbnail: e.target.value })} className={inputCls(false)} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer h-[38px]">
                    <input type="checkbox" checked={Boolean(course.isPublished)} onChange={e => setPatch({ isPublished: e.target.checked })} className="rounded accent-emerald-500" />
                    <span className={`text-sm ${course.isPublished ? 'text-emerald-400' : 'text-slate-400'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-200">Modules</h4>
                <button onClick={addModule} className="text-xs bg-emerald-700/60 hover:bg-emerald-600 px-3 py-1.5 rounded">Add Module</button>
              </div>
              {errors.modules && <p className="text-xs text-red-400">{errors.modules}</p>}

              <div className="space-y-3">
                {course.modules.map((m, mi) => (
                  <div key={m.id} className="border border-slate-700/40 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <input value={m.title} onChange={e => updateModule(m.id, { title: e.target.value })} placeholder="Module title" className={inputCls(false) + ' flex-1'} />
                      <button onClick={() => removeModule(m.id)} className="text-xs bg-red-900/50 hover:bg-red-700 px-2 py-1 rounded">Remove</button>
                    </div>
                    <textarea value={m.description} onChange={e => updateModule(m.id, { description: e.target.value })} placeholder="Module description" className={`${inputCls(false)} mt-2`} rows={2} />

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Lessons ({m.lessons.length})</span>
                        <button onClick={() => addLesson(m.id)} className="text-xs bg-indigo-700/60 hover:bg-indigo-600 px-2 py-1 rounded">Add Lesson</button>
                      </div>

                      <div className="space-y-2">
                        {m.lessons.map((l, li) => (
                          <LessonEditor
                            key={l.id}
                            lesson={l}
                            moduleId={m.id}
                            isOnlyLesson={m.lessons.length === 1}
                            onRemove={() => removeLesson(m.id, l.id)}
                            onUpdate={(patch) => updateLesson(m.id, l.id, patch)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl sticky bottom-0">
          <p className="text-xs text-slate-500">* Required fields</p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:bg-slate-800">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium">
              {saving ? 'Saving…' : (initial ? 'Update Course' : 'Create Course')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}