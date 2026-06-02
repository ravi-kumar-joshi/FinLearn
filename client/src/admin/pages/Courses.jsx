import { useState, useEffect } from 'react'
import { MdAdd, MdCheckCircle, MdErrorOutline, MdRefresh, MdLock } from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import CourseTable from '../components/CourseTable'
import CourseModal from '../components/CourseModal'
import api from '../services/api'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [unauth, setUnauth] = useState(false)
  const [loading, setLoading] = useState({})
  const [mainLoading, setMainLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function load() {
    try {
      setMainLoading(true)
      setError(null)
      const res = await api.getCourses()
      setCourses(res.courses || [])
      setUnauth(false)
    } catch (err) {
      if (err.status === 403) { setUnauth(true); setError('You need to be an admin to view courses.') }
      else setError(`Failed to load courses: ${err.message}`)
    } finally {
      setMainLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  function handleAdd() { setEditing(null); setOpen(true); setError(null) }
  function handleEdit(c) { setEditing(c); setOpen(true); setError(null) }

  async function handleSave(payload) {
    try {
      setError(null); setSuccess(null)
      const normalized = {
        ...payload,
        modules: (payload.modules || []).map(m => ({
          id: m.id, title: m.title, order: m.order,
          description: m.description || '', xpReward: m.xpReward ?? 100,
          lessons: (m.lessons || []).map(l => ({
            id: l.id, title: l.title, duration: l.duration,
            xpReward: l.xpReward ?? 20, content: l.content,
            videoUrl: l.videoUrl || null, resources: l.resources || [],
            quiz: { questions: l.quiz?.questions || [] }
          }))
        }))
      }
      if (payload._id || payload.id) {
        const id = payload._id || payload.id
        const res = await api.updateCourse(id, normalized)
        setCourses(cs => cs.map(x => (x._id === id || x.id === id) ? res.course : x))
        setSuccess(`Course "${payload.title}" updated successfully!`)
      } else {
        const res = await api.createCourse(normalized)
        setCourses(cs => [res.course, ...cs])
        setSuccess(`Course "${payload.title}" created successfully!`)
      }
      setOpen(false); setEditing(null)
    } catch (err) {
      if (err.status === 403) { setUnauth(true); setError('You need to be an admin to manage courses.') }
      else setError(`Save failed: ${err.message}`)
    }
  }

  async function handleDelete(id) {
    try {
      setError(null)
      setLoading(prev => ({ ...prev, [id]: true }))
      await api.deleteCourse(id)
      const deleted = courses.find(c => (c._id || c.id) === id)
      setCourses(cs => cs.filter(c => (c._id || c.id) !== id))
      setSuccess(`Course "${deleted?.title}" deleted successfully!`)
    } catch (err) {
      if (err.status === 403) { setUnauth(true); setError('You need to be an admin to delete courses.') }
      else setError(`Delete failed: ${err.message}`)
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  if (unauth) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-900/20 border border-red-800/60 rounded-xl p-8 max-w-md text-center">
          <MdLock className="text-red-400 text-4xl mx-auto mb-3" />
          <p className="font-medium text-red-400 mb-1">Admin access required</p>
          <p className="text-sm text-slate-400">Sign in with admin credentials using the button in the top right.</p>
        </div>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Courses</h2>
            <p className="text-sm text-slate-400 mt-0.5">Manage all courses and content</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={mainLoading}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <MdAdd className="text-lg" /> Add Course
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/60 rounded-lg px-4 py-3">
            <MdErrorOutline className="text-red-400 text-lg shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800/60 rounded-lg px-4 py-3">
            <MdCheckCircle className="text-emerald-400 text-lg shrink-0" />
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        {/* Table / Loader */}
        {mainLoading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <MdRefresh className="text-3xl animate-spin mr-2" />
            <span>Loading courses…</span>
          </div>
        ) : (
          <CourseTable courses={courses} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
        )}

        <CourseModal
          open={open}
          onClose={() => { setOpen(false); setEditing(null); setError(null) }}
          onSave={handleSave}
          initial={editing}
          allCourses={courses}
        />
      </div>
    </AdminLayout>
  )
}