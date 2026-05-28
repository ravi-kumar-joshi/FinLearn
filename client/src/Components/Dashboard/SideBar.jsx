import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import apis from '../../utils/apis'
import httpAction from '../../utils/httpAction'

const SideBar = ({ sidebarOpen, setSidebarOpen }) => {
    const [user, setUser] = useState({})
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    const linkClass = (path) =>
        `w-full ${sidebarOpen ? 'flex items-center space-x-3 px-4 py-3' : 'flex justify-center px-2 py-3'} rounded-lg transition-all duration-200 ${isActive(path)
            ? 'bg-teal-100 text-teal-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`

    const iconClass = (path) =>
        `shrink-0 w-6 h-6 ${isActive(path) ? 'text-teal-600' : 'text-gray-500'}`

    const getUserInfo = async () => {
        const data = { url: apis().getUserProfile }
        const result = await httpAction(data)
        if (result?.status) {
            setUser(result.user || {})
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            getUserInfo()
        }, 200)

        const handleStorageChange = () => {
            getUserInfo()
        }

        window.addEventListener('profileUpdated', handleStorageChange)
        window.addEventListener('storage', handleStorageChange)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('profileUpdated', handleStorageChange)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    return (
        <div
            onMouseEnter={() => typeof window !== 'undefined' && window.innerWidth >= 1024 && setSidebarOpen(true)}
            onMouseLeave={() => typeof window !== 'undefined' && window.innerWidth >= 1024 && setSidebarOpen(false)}
            className={`fixed left-0 top-16 bottom-0 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'} bg-white border-r border-gray-200 overflow-y-auto z-50 transition-all duration-300 shadow-xl lg:shadow-none`}
        >
            <div className={`flex flex-col h-full ${!sidebarOpen && 'hidden lg:flex'}`} role="navigation" aria-label="Sidebar navigation">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-gray-200" />

                    {/* Main Menu */}
                    <nav className={`flex-1 ${sidebarOpen ? 'px-4 py-6' : 'px-2 py-6'} space-y-1`}>

                        {/* Dashboard */}
                        <a href="/dashboard" className={linkClass('/dashboard')}>
                            <svg className={iconClass('/dashboard')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Dashboard</span>}
                        </a>

                        {/* All Courses */}
                        <a href="/dashboard/all-courses" className={linkClass('/dashboard/all-courses')}>
                            <svg className={iconClass('/dashboard/all-courses')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Courses</span>}
                        </a>

                        {/* Tools */}
                        <a href="/dashboard/tools" className={linkClass('/dashboard/tools')}>
                            <svg className={iconClass('/dashboard/tools')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Financial Tools</span>}
                        </a>
                        {/* FinBot */}
                        <a href="/dashboard/finbot" className={linkClass('/dashboard/finbot')}>
                            <svg className={iconClass('/dashboard/finbot')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">FinBot</span>}
                        </a>

                        {/* Progress */}
                        <a href="/dashboard/progress" className={linkClass('/dashboard/progress')}>
                            <svg className={iconClass('/dashboard/progress')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">My Journey</span>}
                        </a>

                        {/* Achievements
                        <a href="/dashboard/achievements" className={linkClass('/dashboard/achievements')}>
                            <svg className={iconClass('/dashboard/achievements')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Achievements</span>}
                        </a> */}

                        {/* Goals
                        <a href="/dashboard/goals" className={linkClass('/dashboard/goals')}>
                            <svg className={iconClass('/dashboard/goals')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Goals</span>}
                        </a> */}
                    </nav>

                    {/* Bottom Menu */}
                    <div className="px-4 py-4 border-t border-gray-200 space-y-1">

                        {/* Profile */}
                        <a href="/dashboard/profile" className={linkClass('/dashboard/profile')}>
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user?.name || 'Profile'}
                                    className={`${sidebarOpen ? 'w-6 h-6' : 'w-4 h-4'} rounded-full shrink-0 object-cover transition-all duration-300`}
                                />
                            ) : (
                                <div className={`${sidebarOpen ? 'w-6 h-6' : 'w-4 h-4'} rounded-full shrink-0 bg-teal-500 flex items-center justify-center transition-all duration-300`}>
                                    <span className={`text-white ${sidebarOpen ? 'text-xs' : 'text-[10px]'} font-semibold`}>
                                        {user?.name?.substring(0, 1)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            {sidebarOpen && <span className="text-sm">Profile & Settings</span>}
                        </a>

                        {/* My Courses */}
                        <a href="/dashboard/all-courses" className={linkClass('/dashboard/all-courses')}>
                            <svg className={iconClass('/dashboard/all-courses')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">My Courses</span>}
                        </a>

                        {/* Help */}
                        <a href="/dashboard/help" className={linkClass('/dashboard/help')}>
                            <svg className={iconClass('/dashboard/help')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {sidebarOpen && <span className="text-sm">Help & Support</span>}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar