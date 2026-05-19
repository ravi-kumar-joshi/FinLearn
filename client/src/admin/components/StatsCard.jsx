import React from 'react'

const accentMap = {
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  indigo:  { text: 'text-indigo-300',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20'  },
  blue:    { text: 'text-blue-300',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
  purple:  { text: 'text-purple-300',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20'  },
  yellow:  { text: 'text-yellow-300',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20'  },
  red:     { text: 'text-red-300',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
  pink:    { text: 'text-pink-300',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20'    },
}

/**
 * Props:
 *   title    string
 *   value    string | number
 *   accent   keyof accentMap  (default: 'emerald')
 *   icon     string (emoji or icon component)
 *   trend    { value: string, up: boolean } | undefined — e.g. { value: '+12%', up: true }
 *   subtitle string | undefined — small muted text below value
 */
export default function StatsCard({ title, value, accent = 'emerald', icon = '📊', trend, subtitle }) {
  const colors = accentMap[accent] || accentMap.emerald

  return (
    <div className={`group p-4 bg-slate-800/40 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/70 transition-all duration-200 cursor-default`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium uppercase tracking-wide ${colors.text} mb-2`}>{title}</div>
          <div className="text-2xl font-bold text-slate-100 truncate">{value}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</div>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend.up ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colors.bg}`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  )
}