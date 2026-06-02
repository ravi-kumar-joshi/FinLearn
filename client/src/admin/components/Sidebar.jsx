import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  MdDashboard, MdMenuBook, MdPeople, MdQuiz,
  MdBarChart, MdDescription, MdSettings,
  MdChevronRight, MdChevronLeft,
} from 'react-icons/md'
import finlearnLogo from '../../asset/apple-touch-icon.png'

// ─── Nav config (single source of truth) ────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: MdDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: MdBarChart, label: 'Analytics', badge: 3 },
      { to: '/reports', icon: MdDescription, label: 'Reports' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/courses', icon: MdMenuBook, label: 'Courses', badge: 12 },
      { to: '/quizzes', icon: MdQuiz, label: 'Quizzes' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/users', icon: MdPeople, label: 'Users', badge: 240 },
    ],
  },
]

const FOOTER_ITEM = { to: '/settings', icon: MdSettings, label: 'Settings' }

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavItem({ to, icon, label, badge, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-emerald-400" />
          )}
          {React.createElement(icon, { className: "h-[18px] w-[18px] shrink-0" })}
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {!collapsed && badge != null && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/80 text-slate-400'
              }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function NavSection({ label, items, collapsed, onNavigate }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => setOpen(o => !o)}
          className="mb-1 flex w-full items-center gap-1 px-3 py-1 text-left"
        >
          <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
            {label}
          </span>
          <MdChevronRight
            className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </button>
      )}

      {(open || collapsed) && (
        <div className="flex flex-col gap-0.5">
          {items.map(item => (
            <NavItem key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar({ mobileOpen = false, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={[
        'flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64',
        'fixed inset-y-0 left-0 z-50 lg:static lg:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >

      {/* Brand */}
      <div className={`flex h-14 items-center border-b border-slate-800 ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'}`}>
        <img src={finlearnLogo} alt="FinLearn Logo" className="h-7 w-7 shrink-0 object-contain" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">FinLearn</p>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-4">
        {NAV_SECTIONS.map(section => (
          <NavSection key={section.label} {...section} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-2 py-3">
        <NavItem {...FOOTER_ITEM} collapsed={collapsed} onNavigate={onNavigate} />
        {!collapsed && (
          <p className="mt-3 px-3 text-xs text-slate-600">
            © {new Date().getFullYear()} FinLearn
          </p>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-md transition-colors hover:border-slate-500 hover:text-slate-200"
      >
        {collapsed
          ? <MdChevronRight className="h-4 w-4" />
          : <MdChevronLeft className="h-4 w-4" />
        }
      </button>
    </aside>
  )
}