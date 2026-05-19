import { useState, useRef, useEffect, useCallback } from 'react'
import { MdMenu, MdClose, MdLogout, MdLogin, MdKeyboardArrowDown } from 'react-icons/md'
import AdminLoginModal from './AdminLoginModal'
import api from '../services/api'

function StatusBadge({ online }) {
    return (
        <span className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 sm:flex ${online ? 'bg-emerald-950 text-emerald-400 ring-emerald-800' : 'bg-slate-800 text-slate-400 ring-slate-700'
            }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            {online ? 'Online' : 'Signed out'}
        </span>
    )
}

function UserPill({ name, initials }) {
    return (
        <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-1 pl-1.5 pr-3 sm:flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {initials}
            </div>
            <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">{name}</span>
            <MdKeyboardArrowDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        </div>
    )
}

function Spinner() {
    return (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    )
}

function LogoutConfirm({ onConfirm, onCancel }) {
    return (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-2xl shadow-black/40">
            <p className="mb-0.5 text-xs font-semibold text-slate-100">Sign out?</p>
            <p className="mb-3 text-xs leading-relaxed text-slate-400">You'll need to sign in again to access the dashboard.</p>
            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-600 bg-slate-700 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600">
                    Cancel
                </button>
                <button onClick={onConfirm} className="flex-1 rounded-lg border border-red-800 bg-red-950 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900">
                    Sign out
                </button>
            </div>
        </div>
    )
}

function getInitials(name = '') {
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AU'
}

/**
 * Props:
 *   isLoggedIn  boolean
 *   user        { name: string, email: string } | null
 *   onAuthChange (userData | null) => void
 */
export default function Topbar({ isLoggedIn = false, user = null, onAuthChange, onMenuClick }) {
    const [loginOpen, setLoginOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const confirmRef = useRef(null)

    useEffect(() => {
        if (!showConfirm) return
        const handler = (e) => { if (!confirmRef.current?.contains(e.target)) setShowConfirm(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showConfirm])

    const handleLogout = useCallback(async () => {
        setLogoutLoading(true)
        setShowConfirm(false)
        await api.logout() // api.logout() already catches errors internally
        onAuthChange?.(null)
        setLogoutLoading(false)
    }, [onAuthChange])

    const handleLoginSuccess = useCallback((userData) => {
        setLoginOpen(false)
        onAuthChange?.(userData)
    }, [onAuthChange])

    const initials = getInitials(user?.name)

    return (
        <>
            <header className="relative z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6 shrink-0">
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                        aria-label="Open menu"
                    >
                        <MdMenu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="relative flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${isLoggedIn ? 'animate-ping bg-emerald-400' : 'bg-slate-600'}`} />
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${isLoggedIn ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        </span>
                        <h1 className="text-sm font-semibold tracking-tight text-slate-100 truncate">Admin Dashboard</h1>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <StatusBadge online={isLoggedIn} />

                    {isLoggedIn ? (
                        <>
                            <UserPill name={user?.name ?? 'Admin User'} initials={initials} />
                            <div className="relative" ref={confirmRef}>
                                <button
                                    onClick={() => setShowConfirm(o => !o)}
                                    disabled={logoutLoading}
                                    className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-300 transition-all hover:border-red-800 hover:bg-red-950 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {logoutLoading ? <><Spinner /> <span className="hidden sm:inline">Signing out…</span></> : <><MdLogout className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign out</span></>}
                                </button>
                                {showConfirm && <LogoutConfirm onConfirm={handleLogout} onCancel={() => setShowConfirm(false)} />}
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => setLoginOpen(true)}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95"
                        >
                            <MdLogin className="h-3.5 w-3.5" />
                            Sign in
                        </button>
                    )}
                </div>
            </header>

            <AdminLoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSuccess={handleLoginSuccess}
            />
        </>
    )
}