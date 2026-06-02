import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import { QuestionCard } from '../Shared/QuizComponents';
import { collectModuleQuizQuestions } from '../../utils/moduleQuizQuestions';

const PASS_SCORE = 70;

/**
 * Inline module quiz: questions come from lesson.quiz in the course payload.
 */
const Quiz = ({ module, modProgress, onComplete }) => {
    const questions = useMemo(() => collectModuleQuizQuestions(module), [module]);

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [finished, setFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const finalizeOnce = useRef(false);

    const passed = !!modProgress?.quizPassed;

    const answeredForCurrent = answers[current] !== undefined;
    const question = questions[current];

    const handleAnswer = (optionIdx) => {
        if (answeredForCurrent) return;
        setAnswers((prev) => ({ ...prev, [current]: optionIdx }));
        setShowFeedback(true);
    };

    const computeScore = (ans) => {
        if (!questions.length) return 100;
        let correct = 0;
        for (let i = 0; i < questions.length; i++) {
            if (ans[i] === questions[i].correctAnswer) correct += 1;
        }
        return Math.round((correct / questions.length) * 100);
    };

    const goNext = () => {
        if (current < questions.length - 1) {
            setCurrent((c) => c + 1);
            setShowFeedback(false);
        } else {
            const sc = computeScore({ ...answers, [current]: answers[current] });
            setFinalScore(sc);
            setFinished(true);
            if (sc >= PASS_SCORE && !passed && !finalizeOnce.current) {
                finalizeOnce.current = true;
                onComplete(sc);
            }
        }
    };

    if (passed && !finished) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                    <Trophy size={48} color="#f59e0b" style={{ display: 'inline' }} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
                    Quiz passed
                </h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>
                    Score: {modProgress?.quizScore ?? '—'}% · You can revisit lessons anytime from the sidebar.
                </p>
            </motion.div>
        );
    }

    if (!questions.length) {
        const doneLessons =
            !!module?.lessons?.length &&
            module.lessons.every((l) =>
                !!modProgress?.lessons?.find((lp) => lp.lessonId === l.id && lp.completed)
            );

        return (
            <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '32px 16px' }}>
                <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
                    There are no multiple-choice questions in this module&apos;s lessons yet.
                    {doneLessons
                        ? ' Complete the module to continue when you’re ready.'
                        : ' Finish all lessons first, then you can finalize this module here.'}
                </p>
                {doneLessons && !passed && (
                    <button
                        type="button"
                        onClick={() => onComplete(100)}
                        style={{
                            padding: '12px 28px',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Complete module (no quiz)
                    </button>
                )}
            </div>
        );
    }

    if (finished && finalScore !== null) {
        const ok = finalScore >= PASS_SCORE;
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 480, margin: '0 auto' }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 12 }}>Results</h3>
                <p style={{ fontSize: 42, fontWeight: 900, color: ok ? '#059669' : '#dc2626', marginBottom: 8 }}>
                    {finalScore}%
                </p>
                <p style={{ color: '#6b7280', marginBottom: 24 }}>
                    {ok ? 'Nice work — module complete!' : `You need ${PASS_SCORE}% to pass. Try again.`}
                </p>
                {!ok && (
                    <button
                        type="button"
                        onClick={() => {
                            setCurrent(0);
                            setAnswers({});
                            setShowFeedback(false);
                            setFinished(false);
                            setFinalScore(null);
                        }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 18px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#374151',
                        }}
                    >
                        <RotateCcw size={16} /> Retake quiz
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                    <QuestionCard
                        question={question}
                        index={current}
                        total={questions.length}
                        onAnswer={handleAnswer}
                        answered={answeredForCurrent}
                        selectedAnswer={answers[current]}
                        showFeedback={showFeedback}
                    />
                    {answeredForCurrent && showFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: 24 }}
                        >
                            <button
                                type="button"
                                onClick={goNext}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    background: '#6366f1',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: 15,
                                }}
                            >
                                {current >= questions.length - 1 ? 'Submit' : 'Next question'}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Quiz;
