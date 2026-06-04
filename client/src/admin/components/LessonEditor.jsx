import React, { useState, useEffect } from 'react'
import { MdDelete, MdClose } from 'react-icons/md'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const inputCls = (err) =>
    `w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 ${err ? 'border-red-500/60' : 'border-slate-700'
    }`

const labelCls = 'block text-xs font-medium text-slate-300 mb-2'

export default function LessonEditor({ lesson, moduleId, onUpdate, onRemove, isOnlyLesson }) {
    const [editorContent, setEditorContent] = useState(lesson.content || '')

    useEffect(() => {
        setEditorContent(lesson.content || '')
    }, [lesson.content])

    const handleContentChange = (content) => {
        setEditorContent(content)
        onUpdate({ ...lesson, content })
    }

    return (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4 space-y-3">
            {/* Lesson Header */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Lesson</span>
                <button
                    onClick={onRemove}
                    disabled={isOnlyLesson}
                    className="flex items-center text-xs bg-red-900/50 hover:bg-red-700 disabled:opacity-30 p-1.5 rounded-lg transition-colors"
                    aria-label="Delete lesson"
                    title={isOnlyLesson ? 'Cannot delete the only lesson' : 'Delete lesson'}
                >
                    <MdDelete />
                </button>
            </div>

            {/* Lesson Title */}
            <div>
                <label className={labelCls}>Lesson Title *</label>
                <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => onUpdate({ ...lesson, title: e.target.value })}
                    placeholder="Lesson title"
                    className={inputCls(false)}
                />
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={labelCls}>Duration (min)</label>
                    <input
                        type="number"
                        min="1"
                        value={lesson.duration}
                        onChange={(e) => onUpdate({ ...lesson, duration: parseInt(e.target.value) || 1 })}
                        className={inputCls(false)}
                    />
                </div>
                <div>
                    <label className={labelCls}>XP Reward</label>
                    <input
                        type="number"
                        min="0"
                        value={lesson.xpReward}
                        onChange={(e) => onUpdate({ ...lesson, xpReward: parseInt(e.target.value) || 0 })}
                        className={inputCls(false)}
                    />
                </div>
                <div>
                    <label className={labelCls}>Video URL</label>
                    <input
                        type="url"
                        value={lesson.videoUrl || ''}
                        onChange={(e) => onUpdate({ ...lesson, videoUrl: e.target.value })}
                        placeholder="https://..."
                        className={inputCls(false)}
                    />
                </div>
            </div>

            {/* Rich Text Editor */}
            <div>
                <label className={labelCls}>Lesson Content * (Rich Text)</label>
                <div className="quill-wrapper bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                    <ReactQuill
                        value={editorContent}
                        onChange={handleContentChange}
                        theme="snow"
                        modules={{
                            toolbar: [
                                [{ header: [2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                ['blockquote', 'code-block'],
                                [{ list: 'ordered' }, { list: 'bullet' }],
                                ['link', 'image'],
                                ['clean'],
                            ],
                        }}
                        formats={['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'list', 'link', 'image']}
                        style={{ height: '250px' }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">Format lesson content with headings, bold, italics, lists, links, and images.</p>
            </div>
        </div>
    )
}
