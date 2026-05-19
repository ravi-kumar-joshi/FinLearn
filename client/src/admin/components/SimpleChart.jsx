import React from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function SimpleChart({ data = [], className = '', label = 'Activity' }) {
  // BUG FIX: guard against empty or single-element arrays (division by zero)
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-36 text-slate-600 text-sm ${className}`}>
        No data available
      </div>
    )
  }

  const w = 560
  const h = 120
  const padX = 4
  const max  = Math.max(...data, 1) // BUG FIX: ensure max is never 0
  const min  = Math.min(...data)

  const pts = data.map((v, i) => ({
    x: data.length === 1 ? w / 2 : padX + (i / (data.length - 1)) * (w - padX * 2),
    y: h - ((v - min) / (max - min || 1)) * (h - 16) - 8,
    v,
  }))

  const linePath  = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath  = `${linePath} L ${pts[pts.length - 1].x},${h} L ${pts[0].x},${h} Z`

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full h-36" aria-label={label} role="img">
        <defs>
          <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(frac => {
          const y = (h - 8) * (1 - frac) + 8
          return <line key={frac} x1={padX} y1={y} x2={w - padX} y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#7c3aed" />
            <circle cx={p.x} cy={p.y} r="2" fill="#e2e8f0" />
          </g>
        ))}

        {/* X-axis labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={h + 18} textAnchor="middle" fontSize="10" fill="#64748b">
            {DAYS[i] ?? `D${i + 1}`}
          </text>
        ))}
      </svg>
    </div>
  )
}