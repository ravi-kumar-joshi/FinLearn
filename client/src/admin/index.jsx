import React from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Quizzes from './pages/Quizzes'
import Settings from './pages/Settings'

function AdminApp() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    )
}

const rootEl = document.getElementById('admin-root')
if (rootEl) {
    createRoot(rootEl).render(<AdminApp />)
}

export default AdminApp
