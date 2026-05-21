import React, { useState, useEffect } from 'react'
import AdminLayout from '../AdminLayout'
import UserTable from '../Components/UserTable'
import api from '../services/api'

export default function Users() {
    const [users, setUsers] = useState([])
    const [unauth, setUnauth] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [actionLoading, setActionLoading] = useState({})

    useEffect(() => {
        load()
    }, [])

    async function load() {
        try {
            setLoading(true)
            setError(null)
            const res = await api.getUsers()
            setUsers(res.users || [])
            setUnauth(false)
        } catch (err) {
            console.error('Error loading users:', err)
            if (err.status === 403) {
                setUnauth(true)
                setError('You need to be an admin to view users.')
            } else {
                setError(`Failed to load users: ${err.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleAdjust(id, action) {
        try {
            setError(null)
            setSuccess(null)
            setActionLoading(prev => ({ ...prev, [id]: action }))

            if (action === 'add') {
                const add = Number(window.prompt('XP to add', '100') || 0)
                if (add > 0) {
                    await api.adjustUserXP(id, 'add', add)
                    setSuccess(`Added ${add} XP successfully!`)
                }
            } else if (action === 'deduct') {
                const sub = Number(window.prompt('XP to deduct', '50') || 0)
                if (sub > 0) {
                    await api.adjustUserXP(id, 'deduct', sub)
                    setSuccess(`Deducted ${sub} XP successfully!`)
                }
            } else if (action === 'reset') {
                if (window.confirm('Are you sure you want to reset this user\'s progress? This cannot be undone.')) {
                    await api.resetUser(id)
                    setSuccess('User progress reset successfully!')
                }
            } else if (action === 'toggleban') {
                const user = users.find(u => u._id === id || u.id === id)
                const isBanning = user?.status !== 'banned'
                if (window.confirm(`Are you sure you want to ${isBanning ? 'ban' : 'unban'} this user?`)) {
                    await api.toggleBanUser(id)
                    setSuccess(`User ${isBanning ? 'banned' : 'unbanned'} successfully!`)
                }
            }
            load()
        } catch (err) {
            console.error('Action failed:', err)
            if (err.status === 403) {
                setUnauth(true)
                setError('You need to be an admin to perform this action.')
            } else {
                setError(`Action failed: ${err.message}`)
            }
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: null }))
        }
    }

    if (unauth) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-slate-300">
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                        <p className="mb-4 font-medium text-red-400">Admin Access Required</p>
                        <p className="text-sm text-slate-400">You need to sign in as an admin to manage users.</p>
                        <p className="text-sm text-slate-400 mt-2">Use the "Sign In" button in the top right to log in.</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-semibold">Users & Gamification</h2>
                    <p className="text-sm text-slate-400 mt-1">Manage users, adjust XP, and view statistics</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-4">
                        <p className="text-emerald-400 text-sm">{success}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <div className="inline-block animate-spin">⏳</div>
                        <p className="mt-2">Loading users...</p>
                    </div>
                ) : (
                    <UserTable users={users} onAdjust={handleAdjust} />
                )}

                {/* Stats Summary */}
                {!loading && users.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700">
                            <div className="text-sm text-slate-400">Total Users</div>
                            <div className="text-2xl font-bold text-slate-100 mt-2">{users.length}</div>
                        </div>
                        <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700">
                            <div className="text-sm text-slate-400">Active Users</div>
                            <div className="text-2xl font-bold text-emerald-400 mt-2">{users.filter(u => u.status === 'active').length}</div>
                        </div>
                        <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700">
                            <div className="text-sm text-slate-400">Banned Users</div>
                            <div className="text-2xl font-bold text-red-400 mt-2">{users.filter(u => u.status === 'banned').length}</div>
                        </div>
                        <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700">
                            <div className="text-sm text-slate-400">Admin Users</div>
                            <div className="text-2xl font-bold text-yellow-400 mt-2">{users.filter(u => u.isAdmin).length}</div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
