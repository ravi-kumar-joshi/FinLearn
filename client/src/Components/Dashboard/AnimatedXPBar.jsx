import React from 'react';
import { motion } from 'framer-motion';


export const LevelCard = ({
    level = 1,
    currentXP = 1450,
    maxXP = 3000, // Adjusted to dynamically represent a real level threshold
    title = "Level 1 • 1,450 XP from courses",
    animated = true
}) => {
    const percentage = Math.min(100, (currentXP / maxXP) * 100);

    return (
        <div className="w-full bg-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Subtle background decoration with high contrast assurance */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header Section: Title, XP description, and Rocket icon */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            XP Progress
                        </h2>
                        <p className="text-sm sm:text-base font-medium text-blue-100 opacity-95">
                            {title}
                        </p>
                    </div>
                    
                    {/* Level Badge / Rocket Icon */}
                    <div className="flex items-center justify-center bg-blue-500/40 p-2 rounded-xl backdrop-blur-xs border border-white/10 shrink-0">
                        <span className="text-xl sm:text-2xl" role="img" aria-label="rocket">
                            🚀
                        </span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full mt-2">
                    {/* Outer Track - Darkened container for maximum contrast against the white bar */}
                    <div className="h-3 sm:h-4 bg-blue-800/80 rounded-full overflow-hidden p-[2px] shadow-inner">
                        {/* Inner Fill - Pure crisp white to guarantee visibility against the dark track */}
                        <motion.div
                            className="h-full bg-white rounded-full relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{
                                duration: animated ? 1 : 0,
                                ease: 'easeOut',
                            }}
                        >
                            {/* High-visibility animated glow accent */}
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Informational Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1 text-xs sm:text-sm font-medium text-blue-500 bg-white p-3 rounded-xl shadow-xs">
                    <span className="text-gray-600">
                        Gain XP by completing lessons and quizzes.
                    </span>
                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                            {percentage.toFixed(0)}%
                        </span>
                        <span className="text-gray-500">
                            {(maxXP - currentXP).toLocaleString()} XP to Level {level + 1}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};