import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';
import LessonView from '../Components/Dashboard/LessonView';
import { LevelProgress, XPReward } from '../Components/Shared/GamificationComponents';
import {
    BookOpen, Trophy, CheckCircle2, ChevronRight, ArrowLeft,
    Zap, Play, Clock, ChevronDown, Flame, Star, Target,
    ChevronLeft, Sparkles, Brain, Medal, Lock,
} from 'lucide-react';
import httpAction from '../utils/httpAction';
import { useSidebarOpen } from '../hooks/useSidebarOpen';
import { notifyCourseProgressUpdated } from '../utils/courseProgressEvents';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finlearn-1.onrender.com';

/* ─────────────────────────── helpers ─────────────────────────── */
function formatMins(mins) {
    const n = Number(mins) || 0;
    if (!n) return null;
    const h = Math.floor(n / 60), m = n % 60;
    return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
}

/* ─────────────────────── floating XP burst ─────────────────────── */
function XPBurst({ amount, onDone }) {
    return (
        <motion.div
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-999 pointer-events-none"
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-10, -60, -90, -120], scale: [0.5, 1.3, 1.1, 0.8] }}
            transition={{ duration: 1.6, times: [0, 0.2, 0.7, 1], ease: 'easeOut' }}
            onAnimationComplete={onDone}
        >
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xl px-5 py-2.5 rounded-2xl shadow-2xl shadow-amber-300/60">
                <Zap size={20} className="fill-white" />
                +{amount} XP
            </div>
        </motion.div>
    );
}

/* ────────────────────── confetti on completion ─────────────────── */
function ConfettiPiece({ delay, x, color, duration }) {
    return (
        <motion.div
            className="fixed w-2.5 h-2.5 rounded-sm z-998 pointer-events-none"
            style={{ backgroundColor: color, left: `${x}%`, top: '-10px' }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ y: '110vh', rotate: 720, opacity: [1, 1, 0] }}
            transition={{ duration, delay, ease: 'easeIn' }}
        />
    );
}

function Confetti({ show }) {
    const piecesRef = useRef(null);
    if (!piecesRef.current) { // eslint-disable-line react-hooks/purity
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
        piecesRef.current = Array.from({ length: 40 }, (_, i) => ({
            id: i, delay: i * 0.04,
            x: Math.random() * 100, // eslint-disable-line react-hooks/purity
            duration: 2.5 + Math.random(), // eslint-disable-line react-hooks/purity
            color: colors[i % colors.length],
        }));
    }
    if (!show) return null;
    return <>{piecesRef.current.map(p => <ConfettiPiece key={p.id} {...p} />)}</>; // eslint-disable-line react-hooks/purity
}

/* ─────────────────────── animated progress ring ─────────────────── */
function Ring({ pct, size = 56, stroke = 5 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const springPct = useSpring(pct, { stiffness: 60, damping: 15 });
    const dash = useTransform(springPct, v => circ - (v / 100) * circ);

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="url(#rg2)" strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circ} style={{ strokeDashoffset: dash }}
            />
            <defs>
                <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ───────────────────────── lesson dot nav ──────────────────────── */
function LessonDots({ lessons, currentIdx, lessonDone, onSelect }) {
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {lessons.map((l, i) => {
                const done = lessonDone(l.id);
                const active = i === currentIdx;
                return (
                    <motion.button
                        key={l.id ?? i}
                        type="button"
                        onClick={() => onSelect(i)}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        title={l.title}
                        className={`rounded-full transition-all duration-200 ${active
                                ? 'w-6 h-2.5 bg-indigo-500'
                                : done
                                    ? 'w-2.5 h-2.5 bg-emerald-400'
                                    : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                            }`}
                    />
                );
            })}
        </div>
    );
}

/* ──────────────────────── streak flame ────────────────────────── */
function StreakFlame({ streak }) {
    return (
        <motion.div
            className="flex items-center gap-1.5 bg-linear-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl px-3 py-1.5 cursor-default select-none"
            whileHover={{ scale: 1.05 }}
            title={`${streak}-day streak!`}
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Flame size={15} className="text-orange-500" />
            </motion.div>
            <span className="text-xs font-extrabold text-orange-600">{streak}</span>
        </motion.div>
    );
}

/* ─────────────────── lesson card (sidebar item) ─────────────────── */
function LessonCard({ lesson, idx, active, done, onClick, isNext }) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-3 py-3 transition-all group relative overflow-hidden ${active
                    ? 'bg-indigo-50 border-l-[3px] border-indigo-500'
                    : 'hover:bg-gray-50/80 border-l-[3px] border-transparent'
                }`}
            whileHover={{ paddingLeft: active ? 12 : 16 }}
            transition={{ duration: 0.15 }}
        >
            {/* subtle hover shimmer */}
            {!active && (
                <motion.div
                    className="absolute inset-0 bg-linear-to-r from-transparent via-indigo-50/40 to-transparent -translate-x-full"
                    whileHover={{ translateX: '200%' }}
                    transition={{ duration: 0.5 }}
                />
            )}
            <div className="flex items-start gap-2.5 relative z-10">
                {/* status icon */}
                <motion.div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all ${done
                            ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200'
                            : active
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                                : isNext
                                    ? 'bg-amber-100 text-amber-600 ring-1 ring-amber-200'
                                    : 'bg-gray-100 text-gray-400'
                        }`}
                    whileHover={done ? { rotate: 360 } : {}}
                    transition={{ duration: 0.4 }}
                >
                    {done ? '✓' : active ? <Play size={8} className="ml-0.5" /> : idx + 1}
                </motion.div>

                <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-snug truncate ${active ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={8} />
                            {formatMins(lesson.duration) || '15m'}
                        </p>
                        {done && <span className="text-[10px] text-emerald-500 font-medium">Done</span>}
                        {isNext && !done && (
                            <span className="text-[10px] text-amber-500 font-medium flex items-center gap-0.5">
                                <Star size={8} /> Up next
                            </span>
                        )}
                        {lesson.xpReward && (
                            <span className="text-[10px] text-amber-600 flex items-center gap-0.5 font-medium">
                                <Zap size={8} />{lesson.xpReward}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.button>
    );
}

/* ─────────────────── completion celebration overlay ─────────────── */
function CompletionOverlay({ lesson, onNext, onQuiz, isLast }) {
    return (
        <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/95 backdrop-blur-sm rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            {/* pulsing ring */}
            <motion.div
                className="w-24 h-24 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-5 shadow-xl shadow-emerald-200"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.1 }}
            >
                <CheckCircle2 size={44} className="text-white" />
            </motion.div>

            <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-xl font-black text-gray-900 mb-1">Lesson Complete! 🎉</h3>
                <p className="text-gray-500 text-sm max-w-xs">"{lesson?.title}"</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-sm font-bold text-amber-700">+{lesson?.xpReward ?? 20} XP earned</span>
                </div>
            </motion.div>

            <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {!isLast && (
                    <motion.button
                        type="button" onClick={onNext}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200"
                    >
                        Next lesson <ChevronRight size={16} />
                    </motion.button>
                )}
                <motion.button
                    type="button" onClick={onQuiz}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl text-sm ${isLast
                            ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                >
                    <Trophy size={15} /> {isLast ? 'Take quiz now' : 'Skip to quiz'}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

/* ────────────────────────── mini-map ──────────────────────────── */
function ModuleMiniMap({ lessons, currentIdx, lessonDone, onSelect }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Target size={12} className="text-indigo-500" /> Module map
                </h4>
            </div>
            <div className="relative flex flex-col gap-1">
                {/* connector line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-linear-to-b from-indigo-200 to-gray-100 rounded-full z-0" />
                {lessons.map((l, i) => {
                    const done = lessonDone(l.id);
                    const active = i === currentIdx;
                    const isNext = i === currentIdx + 1;
                    return (
                        <motion.button
                            key={l.id ?? i}
                            type="button"
                            onClick={() => onSelect(i)}
                            className="flex items-center gap-2.5 relative z-10 group"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.1 }}
                        >
                            <div className={`w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center text-[9px] font-bold transition-all ${done
                                    ? 'bg-emerald-400 border-emerald-400 text-white'
                                    : active
                                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-300'
                                        : isNext
                                            ? 'bg-white border-amber-400 text-amber-600'
                                            : 'bg-white border-gray-200 text-gray-400'
                                }`}>
                                {done ? '✓' : i + 1}
                            </div>
                            <span className={`text-[11px] truncate leading-none transition-all ${active ? 'font-bold text-indigo-700' : done ? 'text-gray-400 line-through' : 'text-gray-600 group-hover:text-gray-900'
                                }`}>
                                {l.title}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────── knowledge check (micro-quiz) ──────────────────────── */
function KnowledgeCheck({ questions, onPass }) {
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(0);
    const [done, setDone] = useState(false);

    if (!questions?.length) return null;
    const q = questions[idx];

    const pick = (optIdx) => {
        if (selected !== null) return;
        setSelected(optIdx);
        if (optIdx === q.correctIndex) setCorrect(c => c + 1);
        setTimeout(() => {
            if (idx + 1 < questions.length) {
                setIdx(i => i + 1);
                setSelected(null);
            } else {
                setDone(true);
            }
        }, 900);
    };

    if (done) {
        const passed = correct >= Math.ceil(questions.length * 0.6);
        return (
            <motion.div
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center">
                    <div className={`text-4xl mb-2`}>{passed ? '🎯' : '🤔'}</div>
                    <p className="font-bold text-gray-900">{passed ? 'Great job!' : 'Keep going!'}</p>
                    <p className="text-sm text-gray-500 mt-1">{correct}/{questions.length} correct</p>
                    {passed && (
                        <motion.button
                            type="button" onClick={onPass}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className="mt-4 px-5 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 flex items-center gap-2 mx-auto"
                        >
                            <Zap size={14} /> Claim bonus XP
                        </motion.button>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        >
            <div className="bg-linear-to-r from-violet-50 to-indigo-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Brain size={14} className="text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700">Quick check</span>
                <span className="ml-auto text-xs text-gray-400">{idx + 1}/{questions.length}</span>
            </div>
            <div className="p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="text-sm font-semibold text-gray-800 mb-3">{q.question}</p>
                        <div className="flex flex-col gap-2">
                            {q.options.map((opt, i) => {
                                let bg = 'bg-gray-50 border-gray-200 text-gray-700';
                                if (selected !== null) {
                                    if (i === q.correctIndex) bg = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                                    else if (i === selected) bg = 'bg-red-50 border-red-300 text-red-700';
                                }
                                return (
                                    <motion.button
                                        key={i} type="button" onClick={() => pick(i)}
                                        whileHover={selected === null ? { scale: 1.02, x: 2 } : {}}
                                        whileTap={selected === null ? { scale: 0.98 } : {}}
                                        className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${bg} ${selected !== null ? 'cursor-default' : 'cursor-pointer'}`}
                                    >
                                        {opt}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

/* ════════════════════════ MAIN PAGE ════════════════════════════ */
const LessonPage = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
    const [xpReward, setXpReward] = useState(null);
    const [showXP, setShowXP] = useState(false);
    const [showXPBurst, setShowXPBurst] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
    const [streak] = useState(3); // from user profile in real app
    const lessonCompleteInFlight = useRef(false);
    const contentRef = useRef(null);

    /* ── swipe gesture support ── */
    const dragX = useMotionValue(0);
    const dragStart = useRef(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const res = await httpAction({ url: `${API_BASE_URL}/courses/${courseId}`, method: 'GET' });
            if (cancelled) return;
            if (res?.success && res.course) { setCourse(res.course); setProgress(res.progress ?? null); }
            else { setCourse(null); setProgress(null); }
            setLoading(false);
        };
        if (courseId) load();
        return () => { cancelled = true; };
    }, [courseId]);

    const selectedModule = useMemo(() => course?.modules?.find((m) => m.id === moduleId), [course, moduleId]);
    const modProgress = useMemo(() => progress?.modules?.find((m) => m.moduleId === moduleId), [progress, moduleId]);
    const lessons = selectedModule?.lessons ?? [];

    useEffect(() => { setCurrentLessonIdx(0); setShowCompletionOverlay(false); }, [moduleId, courseId]);

    const lessonDone = useCallback((lessonId) =>
        !!modProgress?.lessons?.find((lp) => lp.lessonId === lessonId && lp.completed),
        [modProgress]
    );

    const currentLesson = lessons[currentLessonIdx];
    const lessonProgress = modProgress?.lessons?.find((l) => l.lessonId === currentLesson?.id);
    const completedCount = lessons.filter((l) => lessonDone(l.id)).length;
    const progressPct = Math.min(100, (completedCount / Math.max(lessons.length, 1)) * 100);
    const totalXp = progress?.totalXPEarned ?? 0;
    const isLastLesson = currentLessonIdx === lessons.length - 1;

    const handleLessonComplete = useCallback(async () => {
        if (!currentLesson || lessonProgress?.completed || !courseId) return;
        if (lessonCompleteInFlight.current) return;
        lessonCompleteInFlight.current = true;
        try {
            const res = await httpAction({
                url: `${API_BASE_URL}/courses/${courseId}/lesson/${currentLesson.id}/complete`,
                method: 'PUT',
                body: { xpEarned: currentLesson.xpReward ?? 20 },
            });
            if (!res?.progress) return;
            setProgress(res.progress);
            notifyCourseProgressUpdated(courseId);
            const xp = currentLesson.xpReward ?? 20;
            setXpReward(xp);
            setShowXP(true);
            setShowXPBurst(true);
            setShowConfetti(true);
            setShowCompletionOverlay(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } finally {
            lessonCompleteInFlight.current = false;
        }
    }, [courseId, currentLesson, lessonProgress]);

    const goToNext = () => {
        setShowCompletionOverlay(false);
        if (currentLessonIdx < lessons.length - 1) {
            setCurrentLessonIdx((i) => i + 1);
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextLesson = () => {
        if (currentLessonIdx < lessons.length - 1) {
            void handleLessonComplete();
        } else {
            void handleLessonComplete();
            navigate(`/dashboard/course/${courseId}/quiz?moduleId=${encodeURIComponent(moduleId)}`);
        }
    };

    const handlePreviousLesson = () => {
        if (currentLessonIdx > 0) {
            setCurrentLessonIdx((i) => i - 1);
            setShowCompletionOverlay(false);
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const quizHref = `/dashboard/course/${courseId}/quiz?moduleId=${encodeURIComponent(moduleId || '')}`;

    /* ── keyboard navigation ── */
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight' && currentLessonIdx < lessons.length - 1) goToNext();
            if (e.key === 'ArrowLeft' && currentLessonIdx > 0) handlePreviousLesson();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentLessonIdx, lessons.length]);

    /* ── loading state ── */
    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-5">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100" />
                <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={18} className="text-indigo-400" />
                </div>
            </div>
            <div className="text-center">
                <motion.p
                    className="text-gray-600 text-sm font-semibold"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Loading your lesson…
                </motion.p>
                <p className="text-xs text-gray-400 mt-1">Preparing your learning experience</p>
            </div>
        </div>
    );

    if (!course || !selectedModule) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="text-6xl mb-2">📭</motion.div>
            <p className="text-gray-700 font-semibold text-center">This course or module could not be found.</p>
            <motion.button type="button" onClick={() => navigate('/dashboard/all-courses')}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-200">
                Browse all courses
            </motion.button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
            <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Global effects */}
            <Confetti show={showConfetti} />
            {showXPBurst && <XPBurst amount={xpReward ?? 20} onDone={() => setShowXPBurst(false)} />}

            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>

                {/* ── top bar ── */}
                <div className="sticky top-16 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 lg:px-6 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">

                        {/* left: back + title */}
                        <div className="flex items-center gap-3 min-w-0">
                            <motion.button type="button"
                                onClick={() => navigate(`/dashboard/course/${courseId}`)}
                                whileHover={{ x: -3 }}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium shrink-0">
                                <ArrowLeft size={16} />
                                <span className="hidden sm:inline">Back</span>
                            </motion.button>

                            <div className="h-4 w-px bg-gray-200 shrink-0" />

                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 leading-none truncate">{course.title}</p>
                                <p className="text-sm font-bold text-gray-800 leading-snug mt-0.5 truncate max-w-[180px] sm:max-w-[320px]">
                                    {selectedModule.title}
                                </p>
                            </div>
                        </div>

                        {/* right: dots + streak + xp */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden md:block">
                                <LessonDots
                                    lessons={lessons}
                                    currentIdx={currentLessonIdx}
                                    lessonDone={lessonDone}
                                    onSelect={(i) => { setCurrentLessonIdx(i); setShowCompletionOverlay(false); }}
                                />
                            </div>
                            <StreakFlame streak={streak} />
                            <LevelProgress currentXP={totalXp} nextLevelXP={1000} level={Math.floor(totalXp / 1000) + 1} />
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-6">
                    <div className="grid lg:grid-cols-[220px_1fr_220px] gap-5 items-start">

                        {/* ── LEFT: collapsible lesson list ── */}
                        <AnimatePresence>
                            {!sidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20, width: 0 }}
                                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                                    exit={{ opacity: 0, x: -20, width: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="hidden lg:block"
                                >
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-36 overflow-hidden">
                                        {/* header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-linear-to-r from-indigo-50 to-purple-50">
                                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                <BookOpen size={14} className="text-indigo-600" />
                                                Lessons ({lessons.length})
                                            </h3>
                                            <button type="button" onClick={() => setSidebarCollapsed(true)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-gray-100 rounded-md">
                                                <ChevronLeft size={14} />
                                            </button>
                                        </div>

                                        {/* progress bar */}
                                        <div className="px-4 py-2.5 border-b border-gray-50">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="font-bold text-indigo-600">{completedCount}/{lessons.length}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full"
                                                    initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="divide-y divide-gray-50 max-h-[55vh] overflow-y-auto">
                                            {lessons.map((lesson, idx) => (
                                                <LessonCard
                                                    key={lesson.id ?? idx}
                                                    lesson={lesson}
                                                    idx={idx}
                                                    active={idx === currentLessonIdx}
                                                    done={lessonDone(lesson.id)}
                                                    isNext={idx === currentLessonIdx + 1}
                                                    onClick={() => { setCurrentLessonIdx(idx); setShowCompletionOverlay(false); }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* collapsed toggle */}
                        {sidebarCollapsed && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                onClick={() => setSidebarCollapsed(false)}
                                className="hidden lg:flex flex-col items-center justify-center w-10 gap-1.5 bg-white border border-gray-100 rounded-xl shadow-sm py-4 sticky top-36 hover:bg-indigo-50 transition-colors group"
                                title="Show lessons"
                            >
                                <ChevronRight size={14} className="text-gray-400 group-hover:text-indigo-600" />
                                <span className="text-[9px] text-gray-400 font-bold [writing-mode:vertical-rl] group-hover:text-indigo-600">
                                    LESSONS
                                </span>
                            </motion.button>
                        )}

                        {/* ── CENTER: main lesson content ── */}
                        <motion.div
                            ref={contentRef}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.1}
                            onDragStart={() => { dragStart.current = dragX.get(); }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -60 && currentLessonIdx < lessons.length - 1) goToNext();
                                if (info.offset.x > 60 && currentLessonIdx > 0) handlePreviousLesson();
                            }}
                            style={{ x: dragX }}
                        >
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">

                                {/* lesson header banner */}
                                {currentLesson && (
                                    <div className="relative bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 overflow-hidden">
                                        {/* decorative dots */}
                                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
                                            style={{ background: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}
                                        />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-xs text-indigo-200 font-medium">
                                                    Lesson {currentLessonIdx + 1} of {lessons.length}
                                                </span>
                                                {lessonProgress?.completed && (
                                                    <motion.span
                                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                        className="flex items-center gap-1 text-xs text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full"
                                                    >
                                                        {/* <CheckCircle2 size={10} /> Completed */}
                                                    </motion.span>
                                                )}
                                            </div>
                                            <h2 className="text-white font-black text-xl leading-snug">{currentLesson.title}</h2>
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                {currentLesson.duration && (
                                                    <span className="text-indigo-200 text-xs flex items-center gap-1">
                                                        <Clock size={11} /> {formatMins(currentLesson.duration)}
                                                    </span>
                                                )}
                                                {currentLesson.xpReward && (
                                                    <motion.span
                                                        className="flex items-center gap-1 text-xs text-yellow-300 font-bold bg-yellow-400/20 px-2 py-0.5 rounded-full"
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <Zap size={11} /> {currentLesson.xpReward} XP
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* content area */}
                                <div className="p-6 relative">
                                    {/* completion overlay */}
                                    <AnimatePresence>
                                        {showCompletionOverlay && (
                                            <CompletionOverlay
                                                lesson={currentLesson}
                                                isLast={isLastLesson}
                                                onNext={goToNext}
                                                onQuiz={() => navigate(quizHref)}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentLessonIdx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            {currentLesson ? (
                                                <LessonView
                                                    lesson={currentLesson}
                                                    isCompleted={!!lessonProgress?.completed}
                                                    onComplete={handleLessonComplete}
                                                />
                                            ) : (
                                                <p className="text-gray-400 text-center py-20">
                                                    {lessons.length === 0 ? 'No lessons in this module yet.' : 'Select a lesson to begin.'}
                                                </p>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* ── nav buttons ── */}
                                    {lessons.length > 0 && currentLesson && !showCompletionOverlay && (
                                        <div className="mt-8 border-t border-gray-100 pt-5">
                                            {/* keyboard hint */}
                                            <p className="text-center text-[10px] text-gray-300 mb-3 hidden lg:block">
                                                ← → arrow keys to navigate
                                            </p>
                                            <div className="flex gap-3">
                                                <motion.button type="button" onClick={handlePreviousLesson}
                                                    disabled={currentLessonIdx === 0}
                                                    whileHover={{ scale: currentLessonIdx === 0 ? 1 : 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                                                    <ChevronLeft size={16} /> Previous
                                                </motion.button>
                                                <motion.button type="button" onClick={handleNextLesson}
                                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                    className="flex-2 grow py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 relative overflow-hidden">
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/10"
                                                        initial={{ x: '-100%' }}
                                                        whileHover={{ x: '100%' }}
                                                        transition={{ duration: 0.4 }}
                                                    />
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        {isLastLesson ? (
                                                            <><Trophy size={16} /> Take module quiz</>
                                                        ) : (
                                                            <>Next lesson <ChevronRight size={16} /></>
                                                        )}
                                                    </span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* swipe hint (mobile) */}
                            <p className="text-center text-[10px] text-gray-300 mt-2 lg:hidden">
                                Swipe left/right to navigate lessons
                            </p>
                        </motion.div>

                        {/* ── RIGHT: progress + tools ── */}
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            {/* progress card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-36">
                                <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                                    <Medal size={14} className="text-indigo-500" />
                                    Module progress
                                </h4>

                                {/* ring + count */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative shrink-0">
                                        <Ring pct={progressPct} />
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-indigo-700">
                                            {Math.round(progressPct)}%
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">
                                            {completedCount}
                                            <span className="text-sm font-normal text-gray-400">/{lessons.length}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">lessons done</p>
                                        {completedCount > 0 && completedCount < lessons.length && (
                                            <p className="text-xs text-indigo-500 font-medium mt-0.5">
                                                {lessons.length - completedCount} to go!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5 mb-4">
                                    {[
                                        { label: 'Current lesson', value: `${Math.min(currentLessonIdx + 1, lessons.length)} / ${lessons.length}`, icon: Play },
                                        { label: 'Course XP', value: `${totalXp} XP`, icon: Zap },
                                        { label: 'Streak', value: `${streak} days 🔥`, icon: Flame },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <item.icon size={11} className="text-gray-400" />
                                                {item.label}
                                            </div>
                                            <span className="text-xs font-bold text-gray-800">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* XP highlight */}
                                <motion.div
                                    className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                        <Sparkles size={18} className="text-amber-500 shrink-0" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-amber-600 leading-none">Total XP earned</p>
                                        <motion.p
                                            key={totalXp}
                                            initial={{ scale: 1.4, color: '#f59e0b' }}
                                            animate={{ scale: 1, color: '#92400e' }}
                                            transition={{ duration: 0.4 }}
                                            className="font-black text-amber-800 text-xl leading-tight"
                                        >
                                            {totalXp}
                                        </motion.p>
                                    </div>
                                </motion.div>

                                {/* quiz CTA */}
                                <motion.button type="button" onClick={() => navigate(quizHref)}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-200 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full"
                                        transition={{ duration: 0.4 }}
                                    />
                                    <Trophy size={15} />
                                    <span>Module quiz</span>
                                    <ChevronRight size={14} />
                                </motion.button>
                            </div>

                            {/* module map */}
                            <ModuleMiniMap
                                lessons={lessons}
                                currentIdx={currentLessonIdx}
                                lessonDone={lessonDone}
                                onSelect={(i) => { setCurrentLessonIdx(i); setShowCompletionOverlay(false); }}
                            />

                            {/* knowledge check — only show if lesson has inline quiz questions */}
                            {currentLesson?.quickCheck && (
                                <KnowledgeCheck
                                    questions={currentLesson.quickCheck}
                                    onPass={() => { handleLessonComplete(); }}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>

            <XPReward amount={xpReward ?? 0} show={showXP} onComplete={() => setShowXP(false)} />
        </div>
    );
};

export default LessonPage;