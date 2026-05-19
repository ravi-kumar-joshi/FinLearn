import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play, Zap, Trophy, BookOpen } from 'lucide-react';

const ModuleNode = ({ module, index, total, onClick, isLocked }) => {
    const isCompleted = module.status === 'completed';
    const isUnlocked = module.status !== 'locked';

    const nodeColors = {
        completed: { bg: '#d1fae5', border: '#10b981', icon: '#10b981' },
        active: { bg: '#ede9fe', border: '#6366f1', icon: '#6366f1' },
        locked: { bg: '#f3f4f6', border: '#d1d5db', icon: '#9ca3af' },
    };

    const color = nodeColors[module.status];

    return (
        <motion.div
            className="flex flex-col items-center mb-8 cursor-pointer group"
            whileHover={isUnlocked ? { scale: 1.05 } : {}}
            onClick={isUnlocked ? onClick : undefined}
        >
            {/* Connection Line (not on last item) */}
            {index < total - 1 && (
                <motion.div
                    className="w-1 h-16 mb-4"
                    style={{ background: isUnlocked ? color.border : '#e5e7eb' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 }}
                />
            )}

            {/* Node Circle */}
            <motion.div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-2 transition-all mb-4
          ${isUnlocked ? 'cursor-pointer hover:shadow-xl' : 'opacity-60 cursor-not-allowed'}`}
                style={{
                    background: color.bg,
                    borderColor: color.border,
                }}
                whileHover={isUnlocked ? { y: -4 } : {}}
            >
                {isCompleted && (
                    <CheckCircle2 size={32} style={{ color: color.icon }} />
                )}
                {module.status === 'active' && (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Play size={28} style={{ color: color.icon }} fill={color.icon} />
                    </motion.div>
                )}
                {isLocked && (
                    <Lock size={28} style={{ color: color.icon }} />
                )}

                {/* XP Badge */}
                <motion.div
                    className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                >
                    {module.xp}
                    <Zap size={10} className="inline ml-1" />
                </motion.div>
            </motion.div>

            {/* Module Info */}
            <div className="text-center">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{module.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{module.lessonsCount} lessons</p>

                {isUnlocked ? (
                    <motion.button
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
            `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClick}
                    >
                        {isCompleted ? 'Review' : 'Start'}
                    </motion.button>
                ) : (
                    <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                        Complete {module.unlockRequirement}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function ModuleRoadmap({ modules, onModuleClick }) {
    return (
        <motion.div
            className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen size={28} className="text-indigo-600" />
                    Learning Roadmap
                </h2>
                <p className="text-gray-600">Complete each module to unlock the next level</p>
            </div>

            {/* Module Progress Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                        {modules.filter(m => m.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                        {modules.filter(m => m.status === 'active').length}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">
                        {modules.filter(m => m.status === 'locked').length}
                    </div>
                    <div className="text-xs text-gray-600">Locked</div>
                </div>
            </div>

            {/* Roadmap */}
            <div className="flex flex-col items-center py-8">
                {modules.map((module, index) => (
                    <ModuleNode
                        key={index}
                        module={module}
                        index={index}
                        total={modules.length}
                        isActive={module.status === 'active'}
                        onClick={() => onModuleClick(module.id)}
                        isLocked={module.status === 'locked'}
                    />
                ))}
            </div>

            {/* Completion Footer */}
            {modules.every(m => m.status === 'completed') && (
                <motion.div
                    className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-center"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <Trophy size={40} className="mx-auto text-green-600 mb-3" />
                    <h3 className="text-xl font-bold text-green-900 mb-1">Course Complete!</h3>
                    <p className="text-green-700 text-sm">You've unlocked your certificate</p>
                </motion.div>
            )}
        </motion.div>
    );
}
