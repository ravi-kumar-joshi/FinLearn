import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated XP Progress Bar Component
 * Shows real-time XP progress with smooth animations
 */
export const AnimatedXPBar = ({
    currentXP = 0,
    maxXP = 1000,
    showLabel = true,
    animated = true,
    size = 'md',
    color = 'from-green-500 to-emerald-500'
}) => {
    const percentage = Math.min(100, (currentXP / maxXP) * 100);

    const sizeClasses = {
        sm: { bar: 'h-2', container: 'px-2 py-1', text: 'text-xs' },
        md: { bar: 'h-3', container: 'px-3 py-2', text: 'text-sm' },
        lg: { bar: 'h-4', container: 'px-4 py-3', text: 'text-base' },
    };

    const selectedSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`w-full ${selectedSize.container}`}>
            {showLabel && (
                <div className={`flex justify-between items-center mb-2 ${selectedSize.text}`}>
                    <span className="text-gray-600 font-medium">XP Progress</span>
                    <span className="text-gray-700 font-semibold">
                        {currentXP.toLocaleString()} / {maxXP.toLocaleString()}
                    </span>
                </div>
            )}

            <div className={`${selectedSize.bar} bg-gray-200 rounded-full overflow-hidden relative`}>
                <motion.div
                    className={`h-full bg-linear-to-r ${color} rounded-full relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: animated ? 0.8 : 0,
                        ease: 'easeOut',
                    }}
                    style={{
                        boxShadow: `0 0 20px rgba(34, 197, 94, 0.5)`,
                    }}
                >
                    {/* Shimmer effect */}
                    {animated && (
                        <motion.div
                            className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30"
                            animate={{
                                x: ['100%', '-100%'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{
                                width: '20%',
                            }}
                        />
                    )}
                </motion.div>
            </div>

            {/* XP Info */}
            {showLabel && (
                <div className={`mt-2 text-right ${selectedSize.text}`}>
                    <span className="text-blue-600 font-bold">
                        {percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-2">
                        {(maxXP - currentXP).toLocaleString()} XP to next level
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
    const percentage = Math.min(100, (currentXP / maxXP) * 100);

    return (
        <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-blue-100 text-sm font-semibold mb-1">LEVEL</p>
                        <h2 className="text-5xl font-bold">{level}</h2>
                    </div>
                    <div className="text-6xl">
                        {level <= 5 ? '🌱' : level <= 10 ? '🌿' : level <= 20 ? '🌳' : '👑'}
                    </div>
                </div>

                <p className="text-blue-100 text-lg font-semibold mb-4">{title}</p>

                <div className="mb-4">
                    <div className="h-3 bg-blue-900 rounded-full overflow-hidden mb-2">
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
                    <div className="flex justify-between text-xs text-blue-100">
                        <span>{currentXP.toLocaleString()} XP</span>
                        <span>{maxXP.toLocaleString()} XP</span>
                    </div>
                </div>

                <p className="text-blue-100 text-sm">
                    {(maxXP - currentXP).toLocaleString()} XP to next level
                </p>
            </div>
        </div>
    );
};
