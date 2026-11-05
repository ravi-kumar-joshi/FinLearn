import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

export const QuestionCard = ({ question, index, total, onAnswer, answered, selectedAnswer }) => {
    const [timeLeft, setTimeLeft] = useState(question.timeLimit || 30);

    useEffect(() => {
        if (answered || !question.timeLimit) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onAnswer(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [answered, onAnswer, question.timeLimit]);

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">
                    Question {index + 1} of {total}
                </span>
                {question.timeLimit && (
                    <motion.div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}
                        animate={{ scale: timeLeft <= 10 ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        <Clock size={16} />
                        {timeLeft}s
                    </motion.div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((index + 1) / total) * 100}%` }}
                    transition={{ duration: 0.6 }}
                />
            </div>

            {/* Question */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h3>

                {/* Options */}
                <div className="space-y-3">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;

                        return (
                            <motion.button
                                key={idx}
                                onClick={() => !answered && onAnswer(idx)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all
                  ${isSelected
                                        ? 'bg-indigo-50 border-indigo-500'
                                        : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }
                  ${answered ? 'cursor-default' : 'cursor-pointer'}
                `}
                                whileHover={!answered ? { x: 4 } : {}}
                                whileTap={!answered ? { scale: 0.98 } : {}}
                                disabled={answered}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                      ${isSelected
                                                ? 'bg-indigo-500 border-indigo-500'
                                                : 'bg-white border-gray-300'
                                            }
                    `}
                                    >
                                        {isSelected && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                        )}
                                    </div>
                                    <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                        {option}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

        </motion.div>
    );
};

export const QuizProgressBar = ({ current, total, xpEarned }) => (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
                Progress: {current}/{total}
            </span>
            {xpEarned != null && (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                    <Zap size={14} />
                    +{xpEarned} XP
                </div>
            )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-linear-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(current / total) * 100}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    </div>
);

export const StreakMultiplier = ({ streak }) => {
    let multiplier = 1;
    if (streak >= 3) multiplier = 1.25;
    if (streak >= 5) multiplier = 1.5;
    if (streak >= 7) multiplier = 2;

    return (
        <motion.div
            className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            animate={multiplier > 1 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
        >
            <span className="text-2xl">🔥</span>
            <div>
                <p className="font-bold text-gray-900 text-sm">{streak} Correct in a Row</p>
                <p className="text-xs text-gray-600">{multiplier}x XP Multiplier Active!</p>
            </div>
        </motion.div>
    );
};
