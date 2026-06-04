import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated XP Progress Bar Component
 * Shows real-time XP progress with smooth animations.
 *
 * @param {string} variant - "light" (default, for dark backgrounds) or "dark" (for light backgrounds)
 */
export const AnimatedXPBar = ({
    currentXP = 0,
    maxXP = 1000,
    showLabel = true,
    animated = true,
    size = 'md',
    color = 'from-white to-white',
    variant = 'light',
}) => {
    const safeMax = Math.max(1, maxXP);
    const percentage = Math.min(100, (currentXP / safeMax) * 100);

    const sizeConfig = {
        sm: { bar: 'h-2', text: 'text-xs', gap: 'mb-1' },
        md: { bar: 'h-3 sm:h-3.5', text: 'text-sm', gap: 'mb-2' },
        lg: { bar: 'h-4 sm:h-5', text: 'text-base', gap: 'mb-2' },
    };

    const s = sizeConfig[size] || sizeConfig.md;

    // Variant-based colors
    const isLight = variant === 'light';
    const trackBg = isLight ? 'bg-white/20' : 'bg-gray-200';
    const labelColor = isLight ? 'text-white/90' : 'text-gray-600';
    const valueColor = isLight ? 'text-white' : 'text-gray-800';
    const accentColor = isLight ? 'text-blue-100' : 'text-blue-600';
    const subColor = isLight ? 'text-white/70' : 'text-gray-500';

    return (
        <div className="w-full">
            {/* Optional label row */}
            {showLabel && (
                <div className={`flex flex-wrap justify-between items-center gap-1 ${s.gap} ${s.text}`}>
                    <span className={`font-medium ${labelColor}`}>XP Progress</span>
                    <span className={`font-semibold ${valueColor}`}>
                        {currentXP.toLocaleString()} / {maxXP.toLocaleString()}
                    </span>
                </div>
            )}

            {/* Track */}
            <div className={`${s.bar} ${trackBg} rounded-full overflow-hidden relative`}>
                {/* Fill */}
                <motion.div
                    className={`h-full bg-linear-to-r ${color} rounded-full relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: animated ? 0.8 : 0,
                        ease: 'easeOut',
                    }}
                    style={{
                        boxShadow: isLight
                            ? '0 0 12px rgba(255, 255, 255, 0.5)'
                            : '0 0 12px rgba(34, 197, 94, 0.4)',
                    }}
                >
                    {/* Shimmer effect */}
                    {animated && percentage > 2 && (
                        <motion.div
                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['100%', '-100%'] }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ width: '25%' }}
                        />
                    )}
                </motion.div>
            </div>

            {/* Bottom info */}
            {showLabel && (
                <div className={`mt-2 flex flex-wrap items-center justify-between gap-1 ${s.text}`}>
                    <span className={`font-bold ${accentColor}`}>
                        {percentage.toFixed(1)}%
                    </span>
                    <span className={subColor}>
                        {Math.max(0, maxXP - currentXP).toLocaleString()} XP to next level
                    </span>
                </div>
            )}
        </div>
    );
};

/**
 * XP Notification Toast
 * Shows when user gains XP
 */
export const XPNotification = ({ xpGained = 0, show = false, onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.8 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:max-w-sm bg-linear-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2 z-50"
            onAnimationComplete={() => {
                if (show && onComplete) {
                    setTimeout(onComplete, 2000);
                }
            }}
        >
            <span>⚡</span>
            <span>+{xpGained} XP Gained!</span>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
            >
                🎉
            </motion.div>
        </motion.div>
    );
};

/**
 * Level Card Component
 * Displays user level and XP progress beautifully
 */
export const LevelCard = ({
    level = 1,
    currentXP = 0,
    maxXP = 1000,
    title = "Learner",
    animated = true
}) => {
    const safeMax = Math.max(1, maxXP);
    const percentage = Math.min(100, (currentXP / safeMax) * 100);

    return (
        <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-blue-100 text-sm font-semibold mb-1">LEVEL</p>
                        <h2 className="text-4xl sm:text-5xl font-bold">{level}</h2>
                    </div>
                    <div className="text-5xl sm:text-6xl">
                        {level <= 5 ? '🌱' : level <= 10 ? '🌿' : level <= 20 ? '🌳' : '👑'}
                    </div>
                </div>

                <p className="text-blue-100 text-base sm:text-lg font-semibold mb-4">{title}</p>

                <div className="mb-4">
                    <div className="h-3 bg-blue-900/60 rounded-full overflow-hidden mb-2">
                        <motion.div
                            className="h-full bg-linear-to-r from-yellow-300 via-green-300 to-cyan-300"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{
                                duration: animated ? 1 : 0,
                                ease: 'easeOut',
                            }}
                            style={{
                                boxShadow: '0 0 20px rgba(34, 197, 94, 0.7)',
                            }}
                        />
                    </div>
                    <div className="flex flex-wrap justify-between gap-1 text-xs text-blue-100">
                        <span>{currentXP.toLocaleString()} XP</span>
                        <span>{maxXP.toLocaleString()} XP</span>
                    </div>
                </div>

                <p className="text-blue-100 text-sm">
                    {Math.max(0, maxXP - currentXP).toLocaleString()} XP to next level
                </p>
            </div>
        </div>
    );
};
