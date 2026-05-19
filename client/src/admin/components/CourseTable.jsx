import { useState, useEffect } from 'react'
import { MdEdit, MdDelete, MdCheck, MdOutlineUnpublished, MdClose } from 'react-icons/md'

const difficultyStyles = {
  Beginner: 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50',
  Intermediate: 'bg-amber-900/40 text-amber-400 border border-amber-800/50',
  Advanced: 'bg-red-900/40 text-red-400 border border-red-800/50',
}

export default function CourseTable({ courses = [], onEdit, onDelete, loading = {} }) {
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Auto-clear confirm state after 4 s if user doesn't click
  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(null), 4000)
    return () => clearTimeout(t)
  }, [confirmDelete])

  function handleDelete(id) {
    if (confirmDelete === id) {
      onDelete(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  if (!courses.length) return (
    <div className="bg-slate-800/30 border border-slate-700/60 rounded-xl p-12 text-center text-slate-500">
      No courses found. Click <span className="text-emerald-400 font-medium">Add Course</span> to create one.
    </div>
  )

  return (
    <div className="bg-slate-800/30 border border-slate-700/60 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '80px' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '160px' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/40 text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Thumb</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-center">Category</th>
              <th className="px-4 py-3 text-center">Difficulty</th>
              <th className="px-4 py-3 text-center">Modules</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {courses.map(c => {
              const id = c._id || c.id
              const isLoading = !!loading[id]
              return (
                <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={c.thumbnail || ''}
                      alt={c.title || "Course thumbnail"}
                      className="w-16 h-10 object-cover rounded-lg bg-slate-700"
                      onError={e => { e.target.src = `https://via.placeholder.com/64x40/1e293b/475569?text=${encodeURIComponent(c.title?.[0] ?? '?')}` }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-100 truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{c.instructor || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-400 border border-blue-800/50 text-xs whitespace-nowrap">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs whitespace-nowrap ${difficultyStyles[c.difficulty] ?? difficultyStyles.Beginner}`}>
                      {c.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300">{c.modules?.length ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    {c.isPublished
                      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><MdCheck className="text-sm" /> Published</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-slate-500"><MdOutlineUnpublished className="text-sm" /> Draft</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        disabled={isLoading}
                        title="Edit course"
                        className="flex items-center gap-1 text-xs bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <MdEdit className="text-sm" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={isLoading}
                        title={confirmDelete === id ? 'Click again to confirm deletion' : 'Delete course'}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 ${confirmDelete === id
                            ? 'bg-red-600 hover:bg-red-500 ring-2 ring-red-500/30 animate-pulse'
                            : 'bg-red-900/60 hover:bg-red-700'
                          }`}
                      >
                        {isLoading
                          ? <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                          : <MdDelete className="text-sm" />
                        }
                        {isLoading ? '…' : confirmDelete === id ? 'Confirm?' : 'Delete'}
                      </button>
                      {confirmDelete === id && (
                        <button
                          onClick={() => setConfirmDelete(null)}
                          title="Cancel"
                          className="text-slate-400 hover:text-slate-200 p-1 rounded"
                        >
                          <MdClose className="text-sm" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}