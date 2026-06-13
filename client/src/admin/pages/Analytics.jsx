import React, { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import StatsCard from '../components/StatsCard'
import SimpleChart from '../components/SimpleChart'
import api from '../services/api'

export default function Analytics() {
    const [data, setData] = useState({
        users: [],
        courses: [],
        loading: true,
        unauth: false,
        error: null
    })
    const [timeRange, setTimeRange] = useState('7d')

    useEffect(() => {
        load()
    }, [timeRange])

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
            console.error('Analytics load error:', err)
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
                        <p className="text-sm text-slate-400">You need to sign in as an admin to view analytics.</p>
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
                    <p className="mt-4">Loading analytics...</p>
                </div>
            </AdminLayout>
        )
    }

    if (data.error) {
        return (
            <AdminLayout>
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                    <p className="text-red-400 font-medium">Error loading analytics</p>
                    <p className="text-sm text-slate-400 mt-2">{data.error}</p>
                </div>
            </AdminLayout>
        )
    }

    const totalUsers = data.users.length
    const totalCourses = data.courses.length
    const activeUsers = data.users.filter(u => u.status === 'active').length
    const totalXP = data.users.reduce((s, u) => s + (u.xp?.totalXP || 0), 0)

    const engagementData = [65, 89, 120, 156, 189, 210, 245]
    const completionData = [45, 52, 61, 58, 72, 85, 92]

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
                        <p className="text-slate-400 mt-1">Track platform performance and user engagement</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Users" value={totalUsers} accent="emerald" icon="👥" />
                    <StatsCard title="Active Users" value={activeUsers} accent="blue" icon="✓" />
                    <StatsCard title="Total Courses" value={totalCourses} accent="purple" icon="📚" />
                    <StatsCard title="Total XP" value={totalXP.toLocaleString()} accent="yellow" icon="⭐" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-200">User Engagement</h3>
                            <span className="text-xs text-slate-400">Daily active users</span>
                        </div>
                        <SimpleChart data={engagementData} />
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-200">Course Completion Rate</h3>
                            <span className="text-xs text-slate-400">Percentage completed</span>
                        </div>
                        <SimpleChart data={completionData} />
                    </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-semibold text-slate-200 mb-3">User Growth</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">New this week</span>
                                <span className="text-emerald-400">+24</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">New this month</span>
                                <span className="text-emerald-400">+89</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Growth rate</span>
                                <span className="text-emerald-400">+12.5%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-semibold text-slate-200 mb-3">Course Performance</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Avg. completion</span>
                                <span className="text-blue-400">68%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Avg. rating</span>
                                <span className="text-yellow-400">4.7★</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Enrollments</span>
                                <span className="text-purple-400">1,245</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-semibold text-slate-200 mb-3">XP Distribution</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total awarded</span>
                                <span className="text-yellow-400">{totalXP.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Avg. per user</span>
                                <span className="text-slate-200">{totalUsers > 0 ? Math.round(totalXP / totalUsers) : 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Top earner</span>
                                <span className="text-emerald-400">{Math.max(...data.users.map(u => u.xp?.totalXP || 0))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
