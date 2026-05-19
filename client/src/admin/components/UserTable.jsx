import React from 'react'

export default function UserTable({ users, onAdjust }) {
    return (
        <div className="bg-slate-800/40 rounded-lg border border-slate-700 overflow-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="text-xs text-slate-400 bg-slate-900/30">
                    <tr>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Level</th>
                        <th className="px-4 py-2">Total XP</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Admin</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map(u => (
                            <tr key={u._id || u.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="px-4 py-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        {u.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-100">{u.name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-300">{u.email || 'N/A'}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-1 bg-indigo-600/30 rounded text-xs">
                                        L{u.xp?.level || 1}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-slate-200 font-medium">
                                    {(u.xp?.totalXP || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${u.status === 'banned' ? 'bg-red-600/30 text-red-300' : 'bg-emerald-600/30 text-emerald-300'}`}>
                                        {u.status === 'banned' ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {u.isAdmin ? (
                                        <span className="px-2 py-1 bg-yellow-600/30 rounded text-xs text-yellow-300">Admin</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-700/30 rounded text-xs text-slate-400">User</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center space-x-2">
                                    <button onClick={() => onAdjust(u._id || u.id, 'add')} className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded transition">+XP</button>
                                    <button onClick={() => onAdjust(u._id || u.id, 'deduct')} className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded transition">-XP</button>
                                    <button onClick={() => onAdjust(u._id || u.id, 'reset')} className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded transition">Reset</button>
                                    <button onClick={() => onAdjust(u._id || u.id, 'toggleban')} className={`text-xs px-2 py-1 rounded transition ${u.status === 'banned' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                        {u.status === 'banned' ? 'Unban' : 'Ban'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
