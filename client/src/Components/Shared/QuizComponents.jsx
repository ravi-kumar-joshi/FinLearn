import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

export const QuestionCard = ({ question, index, total, onAnswer, answered, selectedAnswer, showFeedback }) => {
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

    const isCorrect = selectedAnswer === question.correctAnswer;
    const showCorrectAnswer = showFeedback && selectedAnswer !== null;

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
                        const isCorrectAnswer = idx === question.correctAnswer;
                        const showAsCorrect = showCorrectAnswer && isCorrectAnswer;
                        const showAsWrong = showCorrectAnswer && isSelected && !isCorrect;

                        return (
                            <motion.button
                                key={idx}
                                onClick={() => !answered && onAnswer(idx)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all
                  ${showAsCorrect
                                        ? 'bg-green-50 border-green-500'
                                        : showAsWrong
                                            ? 'bg-red-50 border-red-500'
                                            : isSelected
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
                      ${showAsCorrect
                                                ? 'bg-green-500 border-green-500'
                                                : showAsWrong
                                                    ? 'bg-red-500 border-red-500'
                                                    : isSelected
                                                        ? 'bg-indigo-500 border-indigo-500'
                                                        : 'bg-white border-gray-300'
                                            }
                    `}
                                    >
                                        {showAsCorrect && <CheckCircle2 size={16} className="text-white" />}
                                        {showAsWrong && <XCircle size={16} className="text-white" />}
                                        {!showCorrectAnswer && isSelected && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                        )}
                                    </div>
                                    <span className={`font-medium ${showAsCorrect
                                        ? 'text-green-900'
                                        : showAsWrong
                                            ? 'text-red-900'
                                            : isSelected
                                                ? 'text-indigo-900'
                                                : 'text-gray-900'
                                        }`}>
                                        {option}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        className={`p-4 rounded-lg border-l-4 ${isCorrect
                            ? 'bg-green-50 border-green-500 text-green-900'
                            : 'bg-red-50 border-red-500 text-red-900'
                            }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex items-start gap-2">
                            {isCorrect ? (
                                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                            ) : (
                                <XCircle size={20} className="shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="font-semibold mb-1">
                                    {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                                </p>
                                <p className="text-sm">{question.explanation}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const QuizProgressBar = ({ current, total, xpEarned }) => (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
                Progress: {current}/{total}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                <Zap size={14} />
                +{xpEarned} XP
            </div>
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
