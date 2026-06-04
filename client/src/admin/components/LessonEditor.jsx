import React, { useState, useEffect } from 'react'
import { MdDelete, MdClose } from 'react-icons/md'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const inputCls = (err) =>
    `w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 ${err ? 'border-red-500/60' : 'border-slate-700'
    }`

const labelCls = 'block text-xs font-medium text-slate-300 mb-2'

export default function LessonEditor({ lesson, moduleId, onUpdate, onRemove, isOnlyLesson }) {
    const [editorContent, setEditorContent] = useState(lesson.content || '')
    const [quiz, setQuiz] = useState(lesson.quiz || { questions: [] })

    useEffect(() => {
        setEditorContent(lesson.content || '')
        setQuiz(lesson.quiz || { questions: [] })
    }, [lesson.content])

    const handleContentChange = (content) => {
        setEditorContent(content)
        onUpdate({ ...lesson, content, quiz })
    }

    // Quiz helpers
    const syncUpdate = (nextQuiz) => {
        setQuiz(nextQuiz)
        onUpdate({ ...lesson, content: editorContent, quiz: nextQuiz })
    }

    const addQuestion = () => {
        const q = { id: `q-${Date.now()}`, question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
        syncUpdate({ questions: [...(quiz.questions || []), q] })
    }

    const removeQuestion = (qid) => {
        syncUpdate({ questions: (quiz.questions || []).filter(q => q.id !== qid) })
    }

    const updateQuestion = (qid, patch) => {
        syncUpdate({ questions: (quiz.questions || []).map(q => q.id === qid ? { ...q, ...patch } : q) })
    }

    const addOption = (qid) => {
        const q = (quiz.questions || []).find(x => x.id === qid)
        if (!q) return
        const next = { ...q, options: [...q.options, ''] }
        updateQuestion(qid, next)
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

            {/* Quiz Editor */}
            <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-200">Quiz</h4>
                    <button onClick={addQuestion} className="text-xs bg-indigo-700/60 hover:bg-indigo-600 px-2 py-1 rounded">Add Question</button>
                </div>
                {(quiz.questions || []).length === 0 && <p className="text-xs text-slate-500">No questions yet.</p>}
                <div className="space-y-3">
                    {(quiz.questions || []).map((q, qi) => (
                        <div key={q.id} className="p-3 bg-slate-900/50 border border-slate-700/40 rounded-lg">
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <label className={labelCls}>Question {qi + 1}</label>
                                    <input value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })} className={inputCls(false)} placeholder="Question text" />
                                </div>
                                <div className="shrink-0">
                                    <button onClick={() => removeQuestion(q.id)} className="text-xs bg-red-900/50 hover:bg-red-700 px-2 py-1 rounded">Remove</button>
                                </div>
                            </div>

                            <div className="mt-2 space-y-2">
                                {(q.options || []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                        <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(q.id, { correctAnswer: oi })} />
                                        <input value={opt} onChange={e => updateQuestion(q.id, { options: q.options.map((o, idx) => idx === oi ? e.target.value : o) })} className={inputCls(false)} placeholder={`Option ${oi + 1}`} />
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <button onClick={() => addOption(q.id)} className="text-xs bg-slate-700/50 hover:bg-slate-700 px-2 py-1 rounded">Add option</button>
                                </div>
                                <div>
                                    <label className={labelCls}>Explanation (optional)</label>
                                    <textarea value={q.explanation || ''} onChange={e => updateQuestion(q.id, { explanation: e.target.value })} className={inputCls(false)} rows={2} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
