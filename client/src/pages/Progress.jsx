import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion"
import SideBar from "../Components/Dashboard/SideBar"
import Navbar from "../Components/Dashboard/Navbar"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useSidebarOpen } from "../hooks/useSidebarOpen"
import { useRealtimeXP } from "../hooks/useRealtimeXP"
import toast from "react-hot-toast"

// ─── Static fallback chart data ───────────────────────────────────────────────
const FALLBACK_CHART = [
  { week: "W1", xp: 100 },
  { week: "W3", xp: 400 },
  { week: "W5", xp: 580 },
  { week: "W7", xp: 800 },
  { week: "W10", xp: 960 },
]

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function CountUp({ to, suffix = "", duration = 1.3 }) {
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString() + suffix)
  useEffect(() => {
    const ctrl = animate(mv, to, { duration, ease: "easeOut" })
    return ctrl.stop
  }, [to, duration])
  return <motion.span>{display}</motion.span>
}

// ─── Thin SVG ring for course progress ───────────────────────────────────────
function Ring({ progress, color, size = 52, stroke = 5 }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - Math.max(0, Math.min(100, progress)) / 100)
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 10, fontWeight: 500,
        color: progress === 0 ? "var(--color-text-tertiary)" : color,
      }}>
        {progress === 0 ? "NEW" : `${progress}%`}
      </span>
    </div>
  )
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-secondary)",
      borderRadius: 8, padding: "8px 14px",
    }}>
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#1D9E75" }}>{payload[0].value} XP</p>
    </div>
  )
}

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: d, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Progress() {
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen()
  const { userData, xpHistory, loading, error } = useRealtimeXP(5000)

  const totalXp = userData?.xp?.totalXP || 0
  const maxXpForLevel = userData?.xp?.maxXPForLevel || 1000
  const currentXpInLevel = userData?.xp?.currentXP || 0
  const level = userData?.xp?.level || 1
  const xpPct = Math.min(100, Math.round((currentXpInLevel / maxXpForLevel) * 100))
  const xpLeft = Math.max(0, maxXpForLevel - currentXpInLevel)
  const streak = userData?.leaderboardStats?.streak || 0
  const rank = userData?.leaderboardStats?.rank || "—"
  const enrolledCourses = userData?.enrolledCourses || []
  const chartData = (xpHistory?.length ? xpHistory : FALLBACK_CHART)

  const levelTitle =
    level <= 3 ? "Analyst" :
      level <= 6 ? "Associate" :
        level <= 10 ? "Portfolio Manager" :
          level <= 15 ? "Senior Advisor" : "Chief Strategist"

  const levelIcon =
    level <= 3 ? "📊" :
      level <= 6 ? "📈" :
        level <= 10 ? "💼" :
          level <= 15 ? "🏦" : "👑"

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">

      <style>{`
        :root {
          --ring-track: #e5e7eb;
          --fin-green: #1D9E75;
          --fin-green-light: rgba(29,158,117,.1);
          --fin-green-border: rgba(29,158,117,.25);
          --fin-amber: #BA7517;
          --fin-amber-light: rgba(186,117,23,.08);
          --fin-amber-border: rgba(186,117,23,.22);
          --fin-blue: #185FA5;
          --fin-blue-light: rgba(24,95,165,.08);
          --fin-blue-border: rgba(24,95,165,.22);
          --fin-purple: #7C3AED;
          --fin-purple-light: rgba(124,58,237,.08);
          --fin-purple-border: rgba(124,58,237,.22);
        }
        @media (prefers-color-scheme: dark) {
          :root { --ring-track: #1e293b; }
        }
        .prog-card {
          background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(248,250,252,.9));
          border: 1px solid rgba(203,213,225,.4);
          border-radius: 24px;
          transition: all .3s cubic-bezier(0.22, 1, 0.36, 1);
          backdrop-filter: blur(10px);
        }
        .prog-card:hover {
          border-color: rgba(29,158,117,.4);
          box-shadow: 0 20px 50px rgba(29,158,117,.1);
          transform: translateY(-2px);
        }
        .course-row {
          background: linear-gradient(135deg, rgba(255,255,255,.8), rgba(248,250,252,.85));
          border: 1px solid rgba(203,213,225,.3);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
          transition: all .25s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
        }
        .course-row:hover {
          border-color: var(--fin-green);
          background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(248,250,252,.9));
          transform: translateX(6px);
          box-shadow: 0 12px 30px rgba(29,158,117,.12);
        }
        .xp-bar-track {
          height: 10px; background: linear-gradient(90deg, rgba(226,232,240,.6), rgba(203,213,225,.5));
          border-radius: 100px; overflow: hidden; position: relative;
          box-shadow: inset 0 2px 4px rgba(0,0,0,.05);
        }
        .stat-pill {
          border-radius: 16px;
          padding: 18px 20px;
          border: 1px solid rgba(203,213,225,.4);
          background: linear-gradient(135deg, rgba(255,255,255,.9), rgba(248,250,252,.85));
          transition: all .3s ease;
        }
        .stat-pill:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(29,158,117,.12);
        }
      `}</style>

      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`pt-20 pb-20 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
        <div className="max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6">

          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* ── Page heading ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 32 }}>
                <h1 style={{
                  fontSize: "clamp(24px,5vw,42px)",
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#0f172a",
                  letterSpacing: "-0.5px"
                }}>
                  Welcome back, <span style={{ background: "linear-gradient(135deg, #1D9E75, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {userData?.name || "Learner"}
                  </span>
                </h1>
                <p style={{ fontSize: "clamp(13px,2vw,16px)", color: "#64748b", marginTop: 4 }}>
                  Level {level} • {levelTitle} • {xpLeft.toLocaleString()} XP to next level
                </p>
              </motion.div>

              {/* ── HERO: Level card ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="prog-card"
                style={{ padding: "28px 30px", marginBottom: 24 }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, "@media(max-width:640px)": { gap: 16 } }}>

                  {/* Left: icon + title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "1 1 220px", minWidth: 0 }}>
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      style={{
                        width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg, var(--fin-green-light), rgba(59,130,246,.08))",
                        border: "2px solid var(--fin-green-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36,
                        boxShadow: "0 0 30px rgba(29,158,117,.15)",
                      }}>
                      {levelIcon}
                    </motion.div>
                    <div style={{ minWidth: 0 }}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                          padding: "5px 12px", borderRadius: 100,
                          background: "var(--fin-green-light)", color: "var(--fin-green)",
                          border: "1px solid var(--fin-green-border)", marginBottom: 8,
                          textTransform: "uppercase",
                        }}>
                        LEVEL {level}
                      </motion.div>
                      <p style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        {levelTitle}
                      </p>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                        Next: Level {level + 1}
                      </p>
                    </div>
                  </div>

                  {/* Center: XP bar */}
                  <div style={{ flex: "2 1 280px", minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10, color: "#475569", fontWeight: 500 }}>
                      <span>{currentXpInLevel.toLocaleString()} XP</span>
                      <span style={{ color: "var(--fin-amber)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        ⚡ {xpLeft.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="xp-bar-track">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPct}%` }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          height: "100%", borderRadius: 100,
                          background: "linear-gradient(90deg, #0F6E56, #1D9E75, #5DCAA5)",
                          boxShadow: "0 0 20px rgba(29,158,117,.4)",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                      {xpPct}% of {maxXpForLevel.toLocaleString()} XP
                    </div>
                  </div>

                  {/* Right: stat pills */}
                  <div style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className="stat-pill"
                      style={{ background: "var(--fin-amber-light)", borderColor: "var(--fin-amber-border)", minWidth: "120px", textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--fin-amber)" }}>{streak} 🔥</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontWeight: 500 }}>Day streak</div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="stat-pill"
                      style={{ background: "var(--fin-blue-light)", borderColor: "var(--fin-blue-border)", minWidth: "120px", textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--fin-blue)" }}>#{rank}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontWeight: 500 }}>Global rank</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* ── Courses + Chart ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 mb-6">

                {/* Course list */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>
                    📚 Enrolled courses
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {enrolledCourses.length === 0 ? (
                      <div className="prog-card" style={{ padding: "24px 20px", textAlign: "center" }}>
                        <p style={{ fontSize: 14, color: "#64748b" }}>No courses enrolled yet.</p>
                        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Explore our library to get started!</p>
                      </div>
                    ) : enrolledCourses.slice(0, 4).map((c, i) => {
                      const progress = c.progressPercent ?? 0
                      const colors = ["#1D9E75", "#185FA5", "#BA7517", "#7C3AED"]
                      const color = colors[i % colors.length]
                      return (
                        <motion.div
                          key={c._id || c.title}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.08 }}
                          className="course-row"
                        >
                          <Ring progress={progress} color={color} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "clamp(12px,2vw,14px)", fontWeight: 600, color: "#0f172a", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.title}
                            </p>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                              {progress === 0 ? "Not started" : progress === 100 ? "✓ Completed" : `${progress}% complete`}
                            </p>
                            {progress > 0 && progress < 100 && (
                              <div style={{ marginTop: 8, height: 4, borderRadius: 100, background: "rgba(203,213,225,.5)" }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.8 }}
                                  style={{ height: "100%", borderRadius: 100, background: color, boxShadow: `0 0 12px ${color}40` }} />
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: 16, color: color, opacity: 0.6 }}>›</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Area chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="prog-card" style={{ padding: "24px 22px 16px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                    <p style={{ fontSize: "clamp(13px,2vw,15px)", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      📈 XP Progress
                    </p>
                    <span style={{
                      fontSize: 11, color: "var(--fin-green)", fontWeight: 700,
                      background: "var(--fin-green-light)", border: "1px solid var(--fin-green-border)",
                      borderRadius: 100, padding: "4px 12px", whiteSpace: "nowrap",
                    }}>
                      Last 30 days
                    </span>
                  </div>
                  <div style={{ height: "240px", marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="gXp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,.3)" vertical={false} />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="xp"
                          stroke="#1D9E75" strokeWidth={3} fill="url(#gXp)"
                          dot={{ r: 4, fill: "white", stroke: "#1D9E75", strokeWidth: 2.5 }}
                          activeDot={{ r: 6, fill: "#1D9E75", stroke: "white", strokeWidth: 2 }}
                          animationDuration={1200}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* ── Stats row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Total XP", value: totalXp, suffix: " XP", icon: "⚡", accentVar: "--fin-green", bgVar: "--fin-green-light", borderVar: "--fin-green-border" },
                  { label: "Day Streak", value: streak, suffix: " days", icon: "🔥", accentVar: "--fin-amber", bgVar: "--fin-amber-light", borderVar: "--fin-amber-border" },
                  { label: "Global Rank", value: rank, suffix: "", prefix: "#", icon: "🏆", accentVar: "--fin-blue", bgVar: "--fin-blue-light", borderVar: "--fin-blue-border" },
                ].map((s, i) => (
                  <motion.div key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="prog-card"
                    style={{ padding: "22px 24px", background: `var(${s.bgVar})`, borderColor: `var(${s.borderVar})` }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, color: `var(${s.accentVar})`, lineHeight: 1 }}>
                      {s.prefix || ""}
                      {typeof s.value === "number"
                        ? <CountUp to={s.value} suffix={s.suffix} />
                        : s.value}
                      {!s.prefix && s.suffix && typeof s.value !== "number" ? s.suffix : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 10, fontWeight: 500 }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}