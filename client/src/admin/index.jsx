import React from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Users from './pages/Users'

function AdminApp() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/users" element={<Users />} />
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
