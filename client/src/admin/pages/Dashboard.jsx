import React, { useEffect, useState } from 'react'
import AdminLayout from '../AdminLayout'
import StatsCard from '../Components/StatsCard'
import Leaderboard from '../Components/Leaderboard'
import SimpleChart from '../Components/SimpleChart'
import api from '../services/api'

export default function Dashboard() {
    const [stats, setStats] = useState({
        users: [],
        courses: [],
        topUsers: [],
        loading: true,
        unauth: false,
        error: null
    })
    const [weeklyEngagement] = useState([80, 120, 100, 160, 200, 180, 220])

    useEffect(() => {
        load()
    }, [])

    async function load() {
        try {
            setStats(s => ({ ...s, loading: true, error: null }))

            const [usersRes, coursesRes, lbRes] = await Promise.all([
                api.getUsers(),
                api.getCourses(),
                api.getLeaderboard(5)
            ])

            setStats({
                users: usersRes.users || [],
                courses: coursesRes.courses || [],
                topUsers: lbRes.topUsers || [],
                loading: false,
                unauth: false,
                error: null
            })
        } catch (err) {
            console.error('Dashboard load error:', err)
            if (err.status === 403) {
                setStats(s => ({ ...s, unauth: true, loading: false }))
            } else {
                setStats(s => ({ ...s, error: err.message, loading: false }))
            }
        }
    }

    if (stats.unauth) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-slate-300">
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                        <p className="mb-4 font-medium text-red-400">Admin Access Required</p>
                        <p className="text-sm text-slate-400">You need to sign in as an admin to view the dashboard.</p>
                        <p className="text-sm text-slate-400 mt-2">Use the "Sign In" button in the top right to log in.</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (stats.loading) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-slate-400">
                    <div className="inline-block animate-spin text-2xl">⏳</div>
                    <p className="mt-4">Loading dashboard...</p>
                </div>
            </AdminLayout>
        )
    }

    if (stats.error) {
        return (
            <AdminLayout>
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                    <p className="text-red-400 font-medium">Error loading dashboard</p>
                    <p className="text-sm text-slate-400 mt-2">{stats.error}</p>
                </div>
            </AdminLayout>
        )
    }

    // Calculate statistics
    const totalUsers = stats.users.length
    const totalCourses = stats.courses.length
    const totalXP = stats.users.reduce((s, u) => s + (u.xp?.totalXP || 0), 0)
    const completionRate = Math.round(
        stats.users.reduce((s, u) => s + (u.leaderboardStats?.completionRate || 0), 0) / Math.max(1, stats.users.length)
    )
    const totalModules = stats.courses.reduce((s, c) => s + (c.modules?.length || 0), 0)
    const publishedCourses = stats.courses.filter(c => c.isPublished).length
    const averageRating = (
        stats.courses.reduce((s, c) => s + (c.rating || 5), 0) / Math.max(1, stats.courses.length)
    ).toFixed(1)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Welcome to the FinanceQuest Admin Panel</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatsCard title="Total Users" value={totalUsers} accent="emerald" icon="👥" />
                    <StatsCard title="Total Courses" value={totalCourses} accent="blue" icon="📚" />
                    <StatsCard title="Total Modules" value={totalModules} accent="purple" icon="📑" />
                    <StatsCard title="Total XP Distributed" value={totalXP.toLocaleString()} accent="emerald" icon="⭐" />
                    <StatsCard title="Course Completion Rate" value={`${completionRate}%`} accent="indigo" icon="✓" />
                    <StatsCard title="Average Rating" value={`${averageRating}★`} accent="yellow" icon="⭐" />
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-semibold text-slate-200 mb-4">Course Overview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Published Courses</span>
                                <span className="font-semibold text-emerald-400">{publishedCourses}/{totalCourses}</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalCourses > 0 ? (publishedCourses / totalCourses) * 100 : 0}%` }}></div>
                            </div>
                            <div className="text-sm text-slate-400 mt-3">
                                Draft Courses: {totalCourses - publishedCourses}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-semibold text-slate-200 mb-4">User Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Active Users</span>
                                <span className="font-semibold text-blue-400">{stats.users.filter(u => u.status === 'active').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Banned Users</span>
                                <span className="font-semibold text-red-400">{stats.users.filter(u => u.status === 'banned').length}</span>
                            </div>
                            <div className="text-sm text-slate-400 mt-3">
                                Admin Users: {stats.users.filter(u => u.isAdmin).length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-200">Weekly Engagement & XP</h3>
                                <span className="text-xs text-slate-400">Last 7 days</span>
                            </div>
                            <SimpleChart data={weeklyEngagement} />
                        </div>
                        <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                            <h3 className="font-semibold text-slate-200 mb-3">Quick Insights</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Average User XP</span>
                                    <span className="text-slate-200">{totalUsers > 0 ? Math.round(totalXP / totalUsers) : 0} XP</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Total Lessons</span>
                                    <span className="text-slate-200">{stats.courses.reduce((s, c) => s + (c.modules?.reduce((ls, m) => ls + (m.lessons?.length || 0), 0) || 0), 0)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">XP Trend</span>
                                    <span className="text-emerald-400">+12% vs last week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Leaderboard users={stats.topUsers.map(u => ({ id: u._id || u.email, username: u.name, xp: u.xp?.totalXP || 0 }))} />
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">Courses by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {['Savings', 'Investing', 'Budgeting', 'Debt', 'Retirement', 'Tax'].map(cat => {
                            const count = stats.courses.filter(c => c.category === cat).length
                            return (
                                <div key={cat} className="p-3 bg-slate-900/50 rounded text-center">
                                    <div className="text-2xl font-bold text-indigo-400">{count}</div>
                                    <div className="text-xs text-slate-400">{cat}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
