import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, TrendingUp, Lock, Unlock } from 'lucide-react';

export const XPReward = ({ amount, show, onComplete }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -80, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    onAnimationComplete={onComplete}
                    className="fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 pointer-events-none z-50"
                >
                    <div className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full shadow-xl font-bold text-lg">
                        <Zap size={20} />
                        +{amount} XP
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const AchievementBadge = ({ badge, show }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="text-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-2xl mb-4 mx-auto border-4 border-white">
                            <Award size={64} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{badge.name}</h3>
                        <p className="text-gray-600 mt-2">{badge.description}</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const StreakIndicator = ({ streak, maxStreak }) => (
    <motion.div
        className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
        whileHover={{ scale: 1.02 }}
    >
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="text-3xl">🔥</div>
        </motion.div>
        <div>
            <div className="text-sm font-bold text-orange-900">{streak} Day Streak</div>
            <div className="text-xs text-orange-700">Personal Best: {maxStreak} days</div>
        </div>
    </motion.div>
);

export const LevelProgress = ({ currentXP, level }) => {
    const progress = (currentXP % 1000) / 10;

    return (
        <motion.div
            className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    <span className="font-bold text-gray-900">Level {level}</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600">{currentXP % 1000}/1000 XP</span>
            </div>
            <div className="relative h-2 bg-indigo-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            </div>
        </motion.div>
    );
};

export const UnlockableFeature = ({ isUnlocked, requiredLevel, icon, title, description }) => {
    const Icon = icon;
    return (
    <motion.div
        className={`relative p-4 rounded-xl border-2 transition-all
      ${isUnlocked
                ? 'bg-white border-green-200 shadow-sm'
                : 'bg-gray-50 border-gray-200 opacity-60 grayscale'
            }`}
        whileHover={isUnlocked ? { y: -2 } : {}}
    >
        {!isUnlocked && (
            <div className="absolute top-2 right-2">
                <Lock size={16} className="text-gray-400" />
            </div>
        )}
        <div className="flex items-start gap-3">
            <Icon size={24} className={isUnlocked ? 'text-indigo-600' : 'text-gray-400'} />
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                <p className="text-xs text-gray-600 mt-1">{description}</p>
                {!isUnlocked && (
                    <p className="text-xs font-semibold text-gray-500 mt-2">Unlock at Level {requiredLevel}</p>
                )}
            </div>
        </div>
    </motion.div>
    );
};

export const MultiplyerBadge = ({ multiplier, active }) => (
    <motion.div
        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all
      ${active ? 'bg-yellow-300 text-gray-900 shadow-lg' : 'bg-gray-100 text-gray-600'}
    `}
        animate={active ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, repeat: Infinity }}
    >
        <Zap size={12} />
        {multiplier}x Multiplier
    </motion.div>
);
