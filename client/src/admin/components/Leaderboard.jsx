import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Target } from 'lucide-react'

const MEDALS = ['🥇', '🥈', '🥉']

const RANK_STYLES = [
  'bg-amber-50 border-amber-200',   // gold
  'bg-slate-50 border-slate-200',   // silver
  'bg-green-50 border-green-200',   // bronze
]

const AVATAR_STYLES = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-violet-100 text-violet-700',
  'bg-red-100 text-red-700',
]

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Leaderboard({ users = [], currentUserRank = null, loading = false }) {
  const safeUsers = Array.isArray(users) ? users : []
  const top = safeUsers.slice(0, 5)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -14 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">Leaderboard</h2>
        </div>
        <span className="text-xs font-semibold text-teal-600">
          {loading ? 'Updating…' : `Top ${Math.min(top.length, 5)}`}
        </span>
      </div>

      {/* List */}
      {top.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
      ) : (
        <motion.ol
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {top.map((u, i) => {
            const name = u.username ?? u.name ?? 'Unknown'
            const xp = (u.xp ?? u.totalXP ?? 0).toLocaleString()
            const rowStyle = RANK_STYLES[i] ?? 'bg-gray-50 border-gray-200'
            const avatarStyle = AVATAR_STYLES[i % AVATAR_STYLES.length]

            return (
              <motion.li
                key={u.id ?? u._id ?? i}
                variants={itemVariants}
                className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all ${rowStyle}`}
              >
                {/* Medal / rank number */}
                <span className="text-base sm:text-lg w-6 text-center shrink-0" aria-label={`Rank ${i + 1}`}>
                  {MEDALS[i] ?? (
                    <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
                  )}
                </span>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarStyle}`}>
                  {getInitials(name)}
                </div>

                {/* Name + XP */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-teal-600">
                      <Zap className="w-3 h-3" />
                      {xp} XP
                    </span>
                    {u.level && (
                      <span className="text-xs text-gray-400">• Level {u.level}</span>
                    )}
                  </div>
                </div>

                {/* Stars for top 3 */}
                {i < 3 && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-amber-400 text-xs tracking-tight shrink-0"
                    aria-hidden="true"
                  >
                    {'★'.repeat(3 - i)}
                  </motion.div>
                )}
              </motion.li>
            )
          })}
        </motion.ol>
      )}

      {/* Your rank */}
      {currentUserRank && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Your rank</p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg bg-blue-50 border border-blue-200"
          >
            <Target className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <div className="text-base font-semibold text-blue-700">#{currentUserRank}</div>
              <div className="text-xs text-blue-500">Keep climbing!</div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}