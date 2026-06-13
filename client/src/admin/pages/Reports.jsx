import React, { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import api from '../services/api'

export default function Reports() {
    const [data, setData] = useState({
        users: [],
        courses: [],
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
            const [usersRes, coursesRes] = await Promise.all([
                api.getUsers(),
                api.getCourses()
            ])
            setData({
                users: usersRes.users || [],
                courses: coursesRes.courses || [],
                loading: false,
                unauth: false,
                error: null
            })
        } catch (err) {
            console.error('Reports load error:', err)
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
                        <p className="text-sm text-slate-400">You need to sign in as an admin to view reports.</p>
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
                    <p className="mt-4">Loading reports...</p>
                </div>
            </AdminLayout>
        )
    }

    if (data.error) {
        return (
            <AdminLayout>
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                    <p className="text-red-400 font-medium">Error loading reports</p>
                    <p className="text-sm text-slate-400 mt-2">{data.error}</p>
                </div>
            </AdminLayout>
        )
    }

    const totalUsers = data.users.length
    const totalCourses = data.courses.length
    const totalXP = data.users.reduce((s, u) => s + (u.xp?.totalXP || 0), 0)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
                    <p className="text-slate-400 mt-1">Generate and view platform reports</p>
                </div>

                {/* Report Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">👥</div>
                            <h3 className="font-semibold text-slate-200">User Report</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Detailed user statistics and activity</p>
                        <div className="text-xs text-slate-500">Last updated: Just now</div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">📚</div>
                            <h3 className="font-semibold text-slate-200">Course Report</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Course performance and completion rates</p>
                        <div className="text-xs text-slate-500">Last updated: Just now</div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">⭐</div>
                            <h3 className="font-semibold text-slate-200">XP Report</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">XP distribution and gamification metrics</p>
                        <div className="text-xs text-slate-500">Last updated: Just now</div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">📊</div>
                            <h3 className="font-semibold text-slate-200">Engagement Report</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">User engagement and activity trends</p>
                        <div className="text-xs text-slate-500">Last updated: Just now</div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">💰</div>
                            <h3 className="font-semibold text-slate-200">Financial Report</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Financial tools usage statistics</p>
                        <div className="text-xs text-slate-500">Last updated: Just now</div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">🎯</div>
                            <h3 className="font-semibold text-slate-200">Quiz Report</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Quiz performance and results</p>
                        <div className="text-xs text-slate-500">Last updated: Just now</div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">Quick Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-sm text-slate-400">Total Users</div>
                            <div className="text-2xl font-bold text-slate-100">{totalUsers}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Total Courses</div>
                            <div className="text-2xl font-bold text-slate-100">{totalCourses}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Total XP Awarded</div>
                            <div className="text-2xl font-bold text-slate-100">{totalXP.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Active Courses</div>
                            <div className="text-2xl font-bold text-slate-100">{data.courses.filter(c => c.isPublished).length}</div>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">Export Reports</h3>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
                            Export as CSV
                        </button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                            Export as PDF
                        </button>
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                            Schedule Report
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
