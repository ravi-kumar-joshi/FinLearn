import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../admin/components/Sidebar'
import Topbar from '../admin/components/Topbar'

export default function AdminLayout() {

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLoggedIn = Boolean(user)

  const handleAuthChange = useCallback((userData) => {

    if (userData) {

      setUser(userData)

      localStorage.setItem(
        'adminUser',
        JSON.stringify(userData)
      )

    } else {

      setUser(null)

      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
    }

  }, [])

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={closeMobileMenu}
        />
      )}

      <Sidebar mobileOpen={mobileMenuOpen} onNavigate={closeMobileMenu} />

      <div className="flex-1 flex flex-col min-w-0 w-full">

        <Topbar
          isLoggedIn={isLoggedIn}
          user={user}
          onAuthChange={handleAuthChange}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 bg-slate-900 flex-1 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
