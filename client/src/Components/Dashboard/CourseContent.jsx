import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Lock, ChevronRight, ChevronLeft, Zap,
    BookOpen, Trophy, Clock, Award, Star, Play,
} from 'lucide-react';
import Quiz from './Quiz';
import LessonView from './LessonView';
import ProgressBar from './ProgressBar';
import Confetti from './Confetti';
import httpAction from '../../utils/httpAction';
import { notifyCourseProgressUpdated } from '../../utils/courseProgressEvents';
import { useSidebarOpen } from '../../hooks/useSidebarOpen';

// In production, route through Vercel proxy (/api/*) to avoid cross-origin issues.
// In dev, call the local Express server directly.
const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5050' : '/api';

// ── Sidebar Module Item ────────────────────────────────────────────────────
const ModuleItem = ({ module, modProgress, isActive, onClick }) => {
    const locked = !modProgress?.unlocked;
    const done = modProgress?.completed;
    const inProg = !locked && !done;
    const lessonsCompleted = modProgress?.lessons?.filter(l => l.completed).length || 0;
    const totalLessons = module.lessons?.length || 0;

    return (
        <button
            onClick={() => !locked && onClick()}
            disabled={locked}
            style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.45 : 1,
                transition: 'all 0.2s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: done ? '#10b981' : inProg ? '#6366f1' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {done ? <CheckCircle2 size={15} color="#fff" /> :
                        locked ? <Lock size={13} color="#9ca3af" /> :
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{module.order}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: isActive ? '#6366f1' : done ? '#111827' : locked ? '#9ca3af' : '#374151',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {locked ? '???' : module.title}
                    </div>
                    {!locked && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                            {done ? 'Completed ✓' : `${lessonsCompleted}/${totalLessons} lessons`}
                        </div>
                    )}
                </div>
                {done && <Star size={13} color="#fbbf24" fill="#fbbf24" />}
            </div>

            {inProg && totalLessons > 0 && (
                <div style={{ marginTop: 8, height: 3, background: '#e5e7eb', borderRadius: 3 }}>
                    <div style={{
                        height: '100%', borderRadius: 3, background: '#6366f1',
                        width: `${(lessonsCompleted / totalLessons) * 100}%`,
                        transition: 'width 0.5s ease',
                    }} />
                </div>
            )}
        </button>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const CourseContent = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();

    const [activeModuleIdx, setActiveModuleIdx] = useState(0);
    const [activeLessonIdx, setActiveLessonIdx] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [celebrate, setCelebrate] = useState(false);
    const [newBadges, setNewBadges] = useState([]);
    const [xpGain, setXpGain] = useState(null);
    const [courseComplete, setCourseComplete] = useState(false);

    const lessonCompleteInFlight = useRef(false);
    const moduleCompleteInFlight = useRef(false);

    // Fetch course + progress
    useEffect(() => {
        const load = async () => {
            try {
                const res = await httpAction({
                    url: `${API_BASE_URL}/courses/${courseId}`,
                    method: 'GET',
                });
                if (!res?.success || !res.course) {
                    setCourse(null);
                    setProgress(null);
                    return;
                }
                setCourse(res.course);
                setProgress(res.progress ?? null);
                // Jump to first incomplete module
                const firstIncomplete = res.progress?.modules?.findIndex(m => m.unlocked && !m.completed);
                if (firstIncomplete > 0) setActiveModuleIdx(firstIncomplete);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    const activeModule = course?.modules?.[activeModuleIdx];
    const activeLesson = activeModule?.lessons?.[activeLessonIdx];
    const modProgress = progress?.modules?.find((m) => m.moduleId === activeModule?.id);
    const lessonProgress = modProgress?.lessons?.find(l => l.lessonId === activeLesson?.id);

    // Complete a lesson
    const handleLessonComplete = async () => {
        if (!activeLesson || lessonProgress?.completed) return;
        if (lessonCompleteInFlight.current) return;
        lessonCompleteInFlight.current = true;
        try {
            const res = await httpAction({
                url: `${API_BASE_URL}/courses/${courseId}/lesson/${activeLesson.id}/complete`,
                method: 'PUT',
                body: {
                    xpEarned: activeLesson.xpReward || 20,
                },
            });
            if (!res?.progress) return;
            setProgress(res.progress);
            notifyCourseProgressUpdated(courseId);
            setXpGain(activeLesson.xpReward || 20);
            if (res.newBadges?.length) setNewBadges(res.newBadges);
            setTimeout(() => setXpGain(null), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            lessonCompleteInFlight.current = false;
        }
    };

    // Complete a module (after quiz pass)
    const handleModuleComplete = async (quizScore) => {
        if (!activeModule?.id || moduleCompleteInFlight.current) return;
        moduleCompleteInFlight.current = true;
        try {
            const res = await httpAction({
                url: `${API_BASE_URL}/courses/${courseId}/module/${activeModule.id}/complete`,
                method: 'PUT',
                body: { quizScore },
            });
            if (!res?.progress) return;
            setProgress(res.progress);
            notifyCourseProgressUpdated(courseId);
            setCelebrate(true);
            if (res.courseCompleted) setCourseComplete(true);
            setTimeout(() => setCelebrate(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            moduleCompleteInFlight.current = false;
        }
    };

    const goNextLesson = () => {
        if (activeLessonIdx < (activeModule?.lessons?.length || 0) - 1) {
            setActiveLessonIdx(a => a + 1);
            handleLessonComplete();
        } else {
            // Last lesson — show quiz
            handleLessonComplete();
            setShowQuiz(true);
        }
    };

    const goPrevLesson = () => {
        if (showQuiz) { setShowQuiz(false); return; }
        if (activeLessonIdx > 0) setActiveLessonIdx(a => a - 1);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: '#6b7280' }}>Loading course...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    if (!course) return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb', gap: 12 }}>
            <p style={{ color: '#374151', fontWeight: 600 }}>We couldn&apos;t load this course.</p>
            <button
                type="button"
                onClick={() => navigate('/dashboard/all-courses')}
                style={{
                    padding: '10px 20px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                Back to courses
            </button>
        </div>
    );

    const totalLessons = course?.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
    const doneLessons = progress?.modules?.reduce((s, m) => s + (m.lessons?.filter(l => l.completed).length || 0), 0) || 0;
    const overallPct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50 font-system">
            <Confetti active={celebrate} />

            {/* XP Float */}
            <AnimatePresence>
                {xpGain && (
                    <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -60 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translateX(-50%)', zIndex: 100,
                            background: '#fef3c7', border: '2px solid #fcd34d', borderRadius: 99,
                            padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none',
                        }}>
                        <Zap size={16} color="#f59e0b" fill="#f59e0b" />
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#92400e' }}>+{xpGain} XP</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Badge Toast */}
            <AnimatePresence>
                {newBadges.length > 0 && (
                    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                        style={{
                            position: 'fixed', top: 80, right: 20, zIndex: 200,
                            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                            padding: '14px 18px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        }}>
                        {newBadges.map(b => (
                            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 24 }}>{b.icon}</span>
                                <div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>New Badge Earned!</div>
                                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setNewBadges([])} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close course menu"
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Left Sidebar ── */}
            <motion.div
                className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 shrink-0
                    fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto shadow-xl lg:shadow-none
                    ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'}`}
            >
                {/* Course header */}
                <div className="p-4 border-b border-gray-100 bg-linear-to-tr from-indigo-600 to-purple-600 text-white">
                    <button onClick={() => navigate('/dashboard/all-courses')} className="mb-2 inline-block bg-white/20 rounded-md px-3 py-1 text-sm text-white">
                        ← Back
                    </button>
                    <div className="text-sm font-bold text-white mb-1">{course?.title}</div>
                    <ProgressBar value={overallPct} color="#fff" trackColor="rgba(255,255,255,0.2)" />
                    <div className="text-xs text-white/80 mt-1">
                        {doneLessons}/{totalLessons} lessons · {overallPct}% complete
                    </div>
                </div>

                {/* Module list */}
                <div className="flex-1 overflow-y-auto">
                    {course?.modules?.map((mod, idx) => (
                        <ModuleItem
                            key={mod.id}
                            module={mod}
                            modProgress={progress?.modules?.find((m) => m.moduleId === mod.id)}
                            isActive={idx === activeModuleIdx && !showQuiz}
                            onClick={() => { setActiveModuleIdx(idx); setActiveLessonIdx(0); setShowQuiz(false); }}
                        />
                    ))}
                </div>

                {/* XP box */}
                <div className="p-4 border-t border-gray-100 bg-amber-50 flex items-center gap-3">
                    <Zap size={16} color="#f59e0b" fill="#f59e0b" />
                    <div>
                        <div className="text-xs text-gray-600">XP Earned</div>
                        <div className="text-lg font-extrabold text-amber-700">{progress?.totalXPEarned || 0}</div>
                    </div>
                    {progress?.isCompleted && (
                        <button
                            onClick={() => navigate(`/dashboard/course/${courseId}/certificate`)}
                            className="ml-auto px-3 py-1 rounded-md bg-indigo-600 text-white text-sm font-semibold"
                        >
                            🎓 Certificate
                        </button>
                    )}
                </div>
            </motion.div>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                {/* Top bar */}
                <div className="h-14 bg-white border-b border-gray-100 flex items-center px-3 sm:px-5 gap-2 sm:gap-3 min-w-0">
                    <button onClick={() => setSidebarOpen(o => !o)} className="bg-gray-100 rounded-md px-2 py-1 text-sm shrink-0">
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-400 hidden sm:inline">{activeModule?.title}</span>
                        <span className="text-gray-300 mx-2 hidden sm:inline">›</span>
                        <span className="text-sm font-semibold text-gray-900 truncate block">{showQuiz ? 'Module Quiz' : activeLesson?.title}</span>
                    </div>
                    {lessonProgress?.completed && !showQuiz && (
                        <span className="text-sm text-emerald-600 font-semibold hidden md:flex items-center gap-2 shrink-0"><CheckCircle2 size={14} />Completed</span>
                    )}
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-amber-50 rounded-full shrink-0">
                        <Zap size={13} color="#f59e0b" fill="#f59e0b" />
                        <span className="text-sm font-semibold text-amber-700">{progress?.totalXPEarned || 0} XP</span>
                    </div>
                </div>

                {/* Lesson tabs */}
                {!showQuiz && activeModule?.lessons?.length > 0 && (
                    <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', display: 'flex', gap: 4, overflowX: 'auto' }}>
                        {activeModule.lessons.map((lesson, idx) => {
                            const lp = modProgress?.lessons?.find(l => l.lessonId === lesson.id);
                            return (
                                <button key={lesson.id} onClick={() => setActiveLessonIdx(idx)}
                                    style={{
                                        padding: '10px 14px', border: 'none', cursor: 'pointer',
                                        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                                        background: 'transparent',
                                        color: activeLessonIdx === idx ? '#6366f1' : '#6b7280',
                                        borderBottom: activeLessonIdx === idx ? '2px solid #6366f1' : '2px solid transparent',
                                        display: 'flex', alignItems: 'center', gap: 5,
                                    }}>
                                    {lp?.completed ? <CheckCircle2 size={12} color="#10b981" /> : <Play size={12} color="#9ca3af" />}
                                    {lesson.title}
                                </button>
                            );
                        })}
                        <button onClick={() => setShowQuiz(true)}
                            style={{
                                padding: '10px 14px', border: 'none', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                background: 'transparent',
                                color: modProgress?.quizPassed ? '#10b981' : '#f59e0b',
                                borderBottom: showQuiz ? '2px solid #f59e0b' : '2px solid transparent',
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                            {modProgress?.quizPassed ? <CheckCircle2 size={12} color="#10b981" /> : '📝'}
                            Module Quiz
                        </button>
                    </div>
                )}

                {/* Content area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                    <AnimatePresence mode="wait">
                        {courseComplete ? (
                            <motion.div key="complete"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: 'center', maxWidth: 560, margin: '60px auto' }}>
                                <div style={{ fontSize: 72, marginBottom: 16 }}>🎓</div>
                                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Course Complete!</h2>
                                <p style={{ color: '#6b7280', marginBottom: 24 }}>You've mastered <strong>{course?.title}</strong> and earned {progress?.totalXPEarned} XP!</p>
                                <button onClick={() => navigate(`/dashboard/course/${courseId}/certificate`)}
                                    style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                                    Download Certificate 🎓
                                </button>
                            </motion.div>
                        ) : showQuiz ? (
                            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Quiz
                                    key={activeModule?.id}
                                    module={activeModule}
                                    modProgress={modProgress}
                                    onComplete={handleModuleComplete}
                                />
                            </motion.div>
                        ) : (
                            <motion.div key={`${activeModuleIdx}-${activeLessonIdx}`}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                {activeLesson ? (
                                    <LessonView
                                        lesson={activeLesson}
                                        isCompleted={!!lessonProgress?.completed}
                                        onComplete={handleLessonComplete}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 60 }}>Select a lesson to begin</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom nav */}
                {!courseComplete && (
                    <div style={{
                        height: 60, background: '#fff', borderTop: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 24px',
                    }}>
                        <button onClick={goPrevLesson} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', background: '#f3f4f6', border: 'none',
                            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151',
                        }}>
                            <ChevronLeft size={15} /> Previous
                        </button>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                            {showQuiz ? 'Quiz' : `Lesson ${activeLessonIdx + 1} of ${activeModule?.lessons?.length || 0}`}
                        </div>
                        {!showQuiz && (
                            <button onClick={goNextLesson} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none',
                                borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            }}>
                                {activeLessonIdx === (activeModule?.lessons?.length || 0) - 1 ? 'Take Quiz' : 'Next'} <ChevronRight size={15} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseContent;
