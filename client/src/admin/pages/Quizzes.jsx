import React, { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../services/api'

export default function Quizzes() {
    const [data, setData] = useState({
        quizzes: [],
        loading: true,
        unauth: false,
        error: null
    })

    useEffect(() => {
        load()
    }, [])

    async function load() {
        try {
            setData(s => ({ ...s, loading: true, error: null }))
            // Mock data for now since quizzes endpoint might not exist
            setData({
                quizzes: [
                    { id: 1, title: 'Basics of Savings', questions: 10, attempts: 245, avgScore: 78, category: 'Savings' },
                    { id: 2, title: 'Investment Fundamentals', questions: 15, attempts: 189, avgScore: 72, category: 'Investing' },
                    { id: 3, title: 'Budgeting 101', questions: 8, attempts: 312, avgScore: 85, category: 'Budgeting' },
                    { id: 4, title: 'Debt Management', questions: 12, attempts: 156, avgScore: 68, category: 'Debt' },
                    { id: 5, title: 'Retirement Planning', questions: 20, attempts: 98, avgScore: 71, category: 'Retirement' },
                ],
                loading: false,
                unauth: false,
                error: null
            })
        } catch (err) {
            console.error('Quizzes load error:', err)
            if (err.status === 403) {
                setData(s => ({ ...s, unauth: true, loading: false }))
            } else {
                setData(s => ({ ...s, error: err.message, loading: false }))
            }
        }
    }

    if (data.unauth) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-slate-300">
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                        <p className="mb-4 font-medium text-red-400">Admin Access Required</p>
                        <p className="text-sm text-slate-400">You need to sign in as an admin to manage quizzes.</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (data.loading) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin text-2xl">⏳</div>
                    <p className="mt-4">Loading quizzes...</p>
                </div>
            </AdminLayout>
        )
    }

    if (data.error) {
        return (
            <AdminLayout>
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                    <p className="text-red-400 font-medium">Error loading quizzes</p>
                    <p className="text-sm text-slate-400 mt-2">{data.error}</p>
                </div>
            </AdminLayout>
        )
    }

    const totalQuizzes = data.quizzes.length
    const totalAttempts = data.quizzes.reduce((s, q) => s + q.attempts, 0)
    const avgScore = Math.round(data.quizzes.reduce((s, q) => s + q.avgScore, 0) / totalQuizzes)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Quizzes</h1>
                        <p className="text-slate-400 mt-1">Manage quizzes and view performance</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
                        + Create Quiz
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <div className="text-sm text-slate-400">Total Quizzes</div>
                        <div className="text-2xl font-bold text-slate-100 mt-2">{totalQuizzes}</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <div className="text-sm text-slate-400">Total Attempts</div>
                        <div className="text-2xl font-bold text-blue-400 mt-2">{totalAttempts.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <div className="text-sm text-slate-400">Average Score</div>
                        <div className="text-2xl font-bold text-emerald-400 mt-2">{avgScore}%</div>
                    </div>
                </div>

                {/* Quizzes Table */}
                <div className="bg-slate-800/40 rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quiz</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Attempts</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Score</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {data.quizzes.map(quiz => (
                                <tr key={quiz.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-200">{quiz.title}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                            {quiz.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-300">{quiz.questions}</td>
                                    <td className="px-4 py-3 text-center text-slate-300">{quiz.attempts}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            quiz.avgScore >= 80 ? 'bg-emerald-900/30 text-emerald-400' :
                                            quiz.avgScore >= 60 ? 'bg-yellow-900/30 text-yellow-400' :
                                            'bg-red-900/30 text-red-400'
                                        }`}>
                                            {quiz.avgScore}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors" title="Edit">
                                                ✏️
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors" title="Delete">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {data.quizzes.length === 0 && (
                    <div className="bg-slate-800/40 rounded-lg p-8 border border-slate-700 text-center">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="font-semibold text-slate-200 mb-2">No quizzes yet</h3>
                        <p className="text-sm text-slate-400 mb-4">Create your first quiz to get started</p>
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
                            + Create Quiz
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
