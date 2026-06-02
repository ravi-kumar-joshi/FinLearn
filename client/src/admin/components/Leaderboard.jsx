import React from 'react'
import { motion } from 'framer-motion'

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = [
  'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
  'from-slate-400/20 to-slate-400/5 border-slate-400/30',
  'from-amber-600/20 to-amber-600/5 border-amber-600/30',
]

export default function Leaderboard({ users = [], currentUserRank = null, loading = false }) {
  // BUG FIX: guard against undefined users prop
  const safeUsers = Array.isArray(users) ? users : []
  const top = safeUsers.slice(0, 5)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  }

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700 w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-slate-200 text-sm">🏆 Leaderboard</div>
        <span className="text-xs text-slate-500">
          {loading ? '⏳ Updating...' : `Top ${Math.min(top.length, 5)}`}
        </span>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
      ) : (
        <motion.ol
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {top.map((u, i) => (
            <motion.li
              key={u.id ?? u._id ?? i}
              variants={itemVariants}
              className={`flex items-center gap-3 p-2.5 rounded-lg border bg-gradient-to-r ${RANK_COLORS[i] ?? 'from-slate-700/20 to-slate-700/5 border-slate-700/30'
                } transition-all hover:scale-105 duration-200`}
            >
              <span className="text-lg shrink-0 w-6 text-center" aria-label={`Rank ${i + 1}`}>
                {MEDALS[i] ?? `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-100 text-sm truncate">
                  {u.username ?? u.name ?? 'Unknown'}
                </div>
                <div className="text-xs text-slate-400">
                  <span className="text-green-400 font-semibold">
                    {(u.xp ?? u.totalXP ?? 0).toLocaleString()} XP
                  </span>
                  {u.level && <span className="ml-2 text-slate-500">• Level {u.level}</span>}
                </div>
              </div>
              {/* Animated badge for top 3 */}
              {i < 3 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-bold text-yellow-400"
                >
                  {i === 0 ? '⭐⭐⭐' : i === 1 ? '⭐⭐' : '⭐'}
                </motion.div>
              )}
            </motion.li>
          ))}
        </motion.ol>
      )}

      {/* Your rank section */}
      {currentUserRank && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 mb-2">YOUR RANK</div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30"
          >
            <span className="text-lg">🎯</span>
            <div className="flex-1">
              <div className="font-medium text-indigo-200 text-sm">Your Position</div>
              <div className="text-xs text-indigo-400">#{currentUserRank}</div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}