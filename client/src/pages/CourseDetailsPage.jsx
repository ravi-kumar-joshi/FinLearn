import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';
import ModuleRoadmap from '../Components/Shared/ModuleRoadmap';
import {
    BookOpen, Users, Clock, Zap, Star, Play, CheckCircle2,
    ChevronDown, ChevronUp, Lock, Award, Target, TrendingUp,
    Share2, Bookmark, BookmarkCheck, ArrowLeft, BarChart2,
    GraduationCap, Layers, ChevronRight, Info, Trophy,
} from 'lucide-react';
import httpAction from '../utils/httpAction';
import { useSidebarOpen } from '../hooks/useSidebarOpen';
import { COURSE_PROGRESS_UPDATED } from '../utils/courseProgressEvents';

const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5050' : '/api';
const DETAIL_POLL_MS = 25000;

/* ─────────────── helpers ─────────────── */
function formatDurationMinutes(mins) {
    const n = Number(mins) || 0;
    if (n <= 0) return '—';
    const h = Math.floor(n / 60);
    const m = n % 60;
    return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ') || `${n} min`;
}

function buildRoadmapModules(course, progress) {
    const ordered = [...(course?.modules || [])].sort(
        (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
    );
    return ordered.map((mod, idx) => {
        const mp = progress?.modules?.find((p) => p.moduleId === mod.id);
        const lessonsCount = mod.lessons?.length ?? 0;
        const prev = idx > 0 ? ordered[idx - 1] : null;
        let status = 'locked';
        if (mp?.completed) status = 'completed';
        else if (mp?.unlocked) status = 'active';
        return {
            id: mod.id,
            title: mod.title,
            description: mod.description || '',
            lessonsCount,
            xp: mod.xpReward ?? 100,
            status,
            unlockRequirement: status === 'locked' && prev ? prev.title || 'previous module' : 'previous module',
        };
    });
}

function estimatedTotalXp(course) {
    return (course?.modules || []).reduce((total, m) => {
        return total + (Number(m.xpReward) || 0) + (m.lessons || []).reduce((ls, L) => ls + (Number(L.xpReward) || 0), 0);
    }, 0);
}

function learningBulletPoints(course) {
    const explicit = course?.learningOutcomes;
    if (Array.isArray(explicit) && explicit.length) return explicit;
    return (course?.modules || [])
        .slice()
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .slice(0, 8)
        .map((m) => m.title)
        .filter(Boolean);
}

function getCompletionPercent(progress) {
    if (!progress?.modules?.length) return 0;
    const completed = progress.modules.filter((m) => m.completed).length;
    return Math.round((completed / progress.modules.length) * 100);
}

/* ─────────────── sub-components ─────────────── */

/** Animated circular progress ring */
function ProgressRing({ percent, size = 80, stroke = 6 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="url(#ringGrad)" strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/** Stat pill badge */
function StatBadge({ icon, label, value, accent }) {
    const IconComp = icon;
    return (
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-white/20">
            <IconComp size={15} className={accent || 'text-white/80'} />
            <span className="text-white text-sm font-medium">{value}</span>
            {label && <span className="text-white/60 text-xs hidden sm:inline">{label}</span>}
        </div>
    );
}

/** Module accordion row */
function ModuleRow({ mod, idx, progress, onStart }) {
    const [expanded, setExpanded] = useState(false);
    const mp = progress?.modules?.find((p) => p.moduleId === mod.id);
    const isCompleted = mp?.completed;
    const isActive = mp?.unlocked && !mp?.completed;
    const isLocked = !mp?.unlocked;

    const statusColor = isCompleted
        ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
        : isActive
            ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
            : 'text-gray-400 bg-gray-50 border-gray-200';

    const statusIcon = isCompleted ? (
        <CheckCircle2 size={18} className="text-emerald-500" />
    ) : isActive ? (
        <Play size={18} className="text-indigo-500" />
    ) : (
        <Lock size={18} className="text-gray-400" />
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border transition-all duration-200 ${isActive
                ? 'border-indigo-200 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
        >
            <button
                type="button"
                onClick={() => !isLocked && setExpanded((p) => !p)}
                className="w-full flex items-center gap-4 p-4 text-left"
            >
                {/* index badge */}
                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border ${statusColor}`}>
                    {isCompleted ? '✓' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {mod.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{mod.lessons?.length ?? 0} lessons</span>
                        <span className="text-xs text-yellow-600 font-semibold flex items-center gap-0.5">
                            <Zap size={11} /> {mod.xpReward ?? 100} XP
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {statusIcon}
                    {!isLocked && (
                        <div className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} className="text-gray-400" />
                        </div>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {expanded && !isLocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                            {mod.description && (
                                <p className="text-sm text-gray-600 mb-3">{mod.description}</p>
                            )}
                            {mod.lessons?.slice(0, 4).map((lesson, li) => (
                                <div key={li} className="flex items-center gap-2 py-1.5 text-sm text-gray-600 border-b border-gray-50 last:border-0">
                                    <BookOpen size={13} className="text-gray-400 shrink-0" />
                                    <span className="truncate">{lesson.title || `Lesson ${li + 1}`}</span>
                                    {lesson.duration && (
                                        <span className="ml-auto text-xs text-gray-400 shrink-0">{formatDurationMinutes(lesson.duration)}</span>
                                    )}
                                </div>
                            ))}
                            {mod.lessons?.length > 4 && (
                                <p className="text-xs text-gray-400 mt-2">+{mod.lessons.length - 4} more lessons</p>
                            )}
                            {isActive && (
                                <motion.button
                                    type="button"
                                    onClick={() => onStart(mod.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="mt-3 w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                                >
                                    <Play size={14} /> Continue module
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/** Floating action card (right sidebar) */
function CourseCard({ course, progress, durationLabel, totalLessonCount, totalXpDisplay, sortedModuleList, onStart, onBookmark, bookmarked }) {
    const pct = getCompletionPercent(progress);
    const hasStarted = pct > 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden sticky top-24">
            {/* thumbnail */}
            {course.thumbnail ? (
                <div className="relative h-40 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
                    <img src={course.thumbnail} alt={course.title || "Course thumbnail"} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            ) : (
                <div className="h-28 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl">
                    📚
                </div>
            )}

            <div className="p-5">
                {/* progress ring + label */}
                {hasStarted && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="relative">
                            <ProgressRing percent={pct} size={56} stroke={5} />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-700">
                                {pct}%
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">In progress</p>
                            <p className="text-xs text-gray-500">
                                {progress?.modules?.filter((m) => m.completed).length ?? 0} / {progress?.modules?.length ?? 0} modules done
                            </p>
                        </div>
                    </div>
                )}

                {/* stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {[
                        { label: 'Level', value: course.difficulty ?? 'Beginner', icon: Target },
                        { label: 'Duration', value: durationLabel, icon: Clock },
                        { label: 'Modules', value: sortedModuleList.length, icon: Layers },
                        { label: 'Lessons', value: totalLessonCount, icon: BookOpen },
                    ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="flex items-center gap-1 mb-1">
                                <item.icon size={12} className="text-gray-400" />
                                <p className="text-xs text-gray-500">{item.label}</p>
                            </div>
                            <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* XP highlight */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">
                    <Trophy size={18} className="text-amber-500 shrink-0" />
                    <div>
                        <p className="text-xs text-amber-700">Earn up to</p>
                        <p className="font-bold text-amber-800">{totalXpDisplay} XP</p>
                    </div>
                </div>

                {/* CTA buttons */}
                <motion.button
                    type="button"
                    onClick={onStart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 mb-2"
                >
                    <Play size={18} />
                    {hasStarted ? 'Continue learning' : 'Start learning'}
                </motion.button>

                <motion.button
                    type="button"
                    onClick={onBookmark}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm border transition-colors ${bookmarked
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {bookmarked ? 'Saved' : 'Save for later'}
                </motion.button>
            </div>

            {/* instructor footer */}
            <div className="px-5 pb-5">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(course.instructor || 'FL').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm font-bold text-gray-800">{course.instructor || 'FinLearn Team'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────── main page ─────────────── */
const CourseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookmarked, setBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);
    const fetchSeq = useRef(0);
    const loadReady = useRef(false);

    /* ── data fetching ── */
    const loadCourse = useCallback(async (silent) => {
        if (!id) return;
        const seq = ++fetchSeq.current;
        if (!silent) setLoading(true);
        try {
            const res = await httpAction({ url: `${API_BASE_URL}/courses/${id}`, method: 'GET' });
            if (seq !== fetchSeq.current) return;
            if (res?.success && res.course) {
                setCourse(res.course);
                setProgress(res.progress ?? null);
            } else {
                setCourse(null);
                setProgress(null);
            }
            loadReady.current = true;
        } finally {
            if (seq === fetchSeq.current) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadReady.current = false;
        if (!id) { setLoading(false); setCourse(null); setProgress(null); return; }
        loadCourse(false);
    }, [id, loadCourse]);

    useEffect(() => {
        const onResume = () => {
            if (document.visibilityState !== 'visible' || !id || !loadReady.current) return;
            loadCourse(true);
        };
        document.addEventListener('visibilitychange', onResume);
        window.addEventListener('focus', onResume);
        return () => { document.removeEventListener('visibilitychange', onResume); window.removeEventListener('focus', onResume); };
    }, [id, loadCourse]);

    useEffect(() => {
        const onProg = (ev) => {
            const cid = ev?.detail?.courseId;
            if (!id) return;
            if (cid != null && String(cid) !== String(id)) return;
            loadCourse(true);
        };
        window.addEventListener(COURSE_PROGRESS_UPDATED, onProg);
        return () => window.removeEventListener(COURSE_PROGRESS_UPDATED, onProg);
    }, [id, loadCourse]);

    useEffect(() => {
        if (!id) return;
        const t = setInterval(() => {
            if (document.visibilityState === 'visible' && loadReady.current) loadCourse(true);
        }, DETAIL_POLL_MS);
        return () => clearInterval(t);
    }, [id, loadCourse]);

    /* ── derived data ── */
    const roadmapModules = useMemo(() => (course ? buildRoadmapModules(course, progress) : []), [course, progress]);
    const durationLabel = useMemo(() => formatDurationMinutes(course?.duration), [course?.duration]);
    const totalLessonCount = useMemo(() => (course?.modules || []).reduce((s, m) => s + (m.lessons?.length ?? 0), 0), [course]);
    const totalXpDisplay = useMemo(() => estimatedTotalXp(course), [course]);
    const outcomes = useMemo(() => learningBulletPoints(course), [course]);
    const sortedModuleList = useMemo(() => [...(course?.modules || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)), [course]);
    const completionPct = useMemo(() => getCompletionPercent(progress), [progress]);
    const completedModules = useMemo(() => (progress?.modules || []).filter((m) => m.completed).length, [progress]);

    /* ── handlers ── */
    const handleModuleClick = (moduleId) => navigate(`/dashboard/course/${id}/lesson/${moduleId}`);
    const handleStartCourse = () => { if (sortedModuleList.length) navigate(`/dashboard/course/${id}/player`); };
    const handleShare = () => {
        navigator.clipboard?.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'curriculum', label: 'Curriculum', icon: Layers },
        { id: 'roadmap', label: 'Roadmap', icon: TrendingUp },
    ];

    /* ── loading / error states ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-16 gap-4">
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-500 text-sm font-medium animate-pulse">Loading course…</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 pt-16 px-4">
                <div className="text-5xl mb-2">🔍</div>
                <p className="text-gray-700 font-semibold text-center">Course not found or unavailable.</p>
                <p className="text-gray-500 text-sm text-center max-w-xs">This course may have been removed or the link is invalid.</p>
                <button type="button" onClick={() => navigate('/dashboard/all-courses')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-200">
                    Browse all courses
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
            <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>

                {/* ── HERO BANNER ── */}
                <motion.div
                    className="relative overflow-hidden"
                    style={{ minHeight: 'auto', background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #6d28d9 100%)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* bg texture */}
                    <div className="absolute inset-0 opacity-5 sm:opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 50%)' }} />

                    {course.thumbnail && (
                        <div className="absolute inset-0 opacity-10 sm:opacity-15 bg-cover bg-center mix-blend-luminosity"
                            style={{ backgroundImage: `url(${course.thumbnail})` }} />
                    )}

                    <div className="relative z-10 px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
                        <div className="max-w-7xl mx-auto">
                            {/* breadcrumb */}
                            <motion.button type="button" onClick={() => navigate('/dashboard/all-courses')}
                                className="flex items-center gap-1.5 text-indigo-200 hover:text-white transition-colors text-sm font-medium mb-6 sm:mb-8"
                                whileHover={{ x: -3 }}>
                                <ArrowLeft size={16} />
                                All courses
                                {course.category && <><ChevronRight size={14} className="text-indigo-400" /><span className="text-indigo-300">{course.category}</span></>}
                            </motion.button>

                            <div className="grid lg:grid-cols-5 gap-8 items-start">
                                <motion.div className="lg:col-span-3"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

                                    {/* badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {course.category && (
                                            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold uppercase tracking-wide">
                                                {course.category}
                                            </span>
                                        )}
                                        {course.difficulty && (
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                                                {course.difficulty}
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                                        {course.title}
                                    </h1>
                                    <p className="text-lg text-indigo-100/90 mb-6 leading-relaxed max-w-2xl">
                                        {course.description || ''}
                                    </p>

                                    {/* stats row */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {course.rating != null && (
                                            <StatBadge icon={Star} value={course.rating} label="rating" accent="text-yellow-300 fill-yellow-300" />
                                        )}
                                        <StatBadge icon={Users} value={(course.totalEnrollments ?? 0).toLocaleString('en-IN')} label="enrolled" />
                                        <StatBadge icon={Clock} value={durationLabel} />
                                        <StatBadge icon={Zap} value={`${totalXpDisplay} XP`} accent="text-yellow-300" />
                                    </div>

                                    {/* progress bar (if started) */}
                                    {completionPct > 0 && (
                                        <div className="mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-sm">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-indigo-200 font-medium">Your progress</span>
                                                <span className="text-xs text-white font-bold">{completionPct}%</span>
                                            </div>
                                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-linear-to-r from-emerald-400 to-teal-400 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${completionPct}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                                />
                                            </div>
                                            <p className="text-xs text-indigo-200 mt-1">{completedModules} of {sortedModuleList.length} modules complete</p>
                                        </div>
                                    )}

                                    {/* CTA + actions */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <motion.button type="button" onClick={handleStartCourse}
                                            className="px-7 py-3.5 bg-white text-indigo-700 font-bold rounded-xl flex items-center gap-2 shadow-xl hover:bg-indigo-50 transition-colors"
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                            <Play size={18} className="fill-current" />
                                            {completionPct > 0 ? 'Continue learning' : 'Start learning'}
                                        </motion.button>

                                        <motion.button type="button" onClick={() => setBookmarked((p) => !p)}
                                            className={`p-3 rounded-xl border transition-colors ${bookmarked ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/15'}`}
                                            whileTap={{ scale: 0.9 }} title="Save for later">
                                            {bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                                        </motion.button>

                                        <motion.button type="button" onClick={handleShare}
                                            className="p-3 rounded-xl border bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/15 transition-colors relative"
                                            whileTap={{ scale: 0.9 }} title="Share course">
                                            <Share2 size={20} />
                                            <AnimatePresence>
                                                {copied && (
                                                    <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                                                        Copied!
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                </motion.div>

                                {/* hero decorative right */}
                                <motion.div className="hidden lg:flex lg:col-span-2 justify-end items-start"
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
                                    <div className="relative">
                                        <div className="absolute -inset-4 rounded-3xl bg-white/5 blur-2xl" />
                                        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-56 space-y-4">
                                            {[
                                                { icon: GraduationCap, label: 'Modules', value: sortedModuleList.length },
                                                { icon: BookOpen, label: 'Lessons', value: totalLessonCount },
                                                { icon: BarChart2, label: 'Level', value: course.difficulty ?? 'Beginner' },
                                                { icon: Award, label: 'Certificate', value: 'On completion' },
                                            ].map((item) => (
                                                <div key={item.label} className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                                                        <item.icon size={16} className="text-white/80" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-indigo-200">{item.label}</p>
                                                        <p className="text-sm font-bold text-white">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── CONTENT AREA ── */}
                <div className="px-4 lg:px-8 py-8">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

                        {/* LEFT: tabs + content */}
                        <div className="lg:col-span-2">
                            {/* tab navigation */}
                            <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 shadow-sm">
                                {tabs.map((tab) => (
                                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}>
                                        <tab.icon size={15} />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <BookOpen size={22} className="text-indigo-500" />
                                                About this course
                                            </h2>
                                            <p className="text-gray-600 leading-relaxed">
                                                {(course.fullDescription ?? course.description) || ''}
                                            </p>
                                        </div>

                                        {outcomes.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                                    What you'll learn
                                                </h3>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {outcomes.map((outcome, idx) => (
                                                        <motion.div key={idx}
                                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.04 }}
                                                            className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                            <span className="text-emerald-500 font-bold text-lg leading-none mt-0.5">✓</span>
                                                            <span className="text-gray-700 text-sm">{outcome}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* quick stats cards */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Total XP', value: `${totalXpDisplay}`, sub: 'points to earn', color: 'from-amber-400 to-orange-400', icon: '⚡' },
                                                { label: 'Modules', value: sortedModuleList.length, sub: 'chapters', color: 'from-indigo-400 to-purple-500', icon: '📦' },
                                                { label: 'Lessons', value: totalLessonCount, sub: 'total lessons', color: 'from-teal-400 to-cyan-500', icon: '📖' },
                                                { label: 'Duration', value: durationLabel, sub: 'estimated', color: 'from-rose-400 to-pink-500', icon: '⏱' },
                                            ].map(({ label, value, sub, color, icon }) => (
                                                <motion.div key={label} whileHover={{ y: -2 }}
                                                    className={`rounded-2xl bg-linear-to-br ${color} p-4 text-white shadow-md`}>
                                                    <div className="text-2xl mb-1">{icon}</div>
                                                    <p className="text-2xl font-extrabold">{value}</p>
                                                    <p className="text-xs text-white/75 mt-0.5">{sub}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* CURRICULUM TAB */}
                                {activeTab === 'curriculum' && (
                                    <motion.div key="curriculum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">{sortedModuleList.length} Modules</h2>
                                                <p className="text-sm text-gray-500">{totalLessonCount} lessons · {durationLabel} total</p>
                                            </div>
                                            {completionPct > 0 && (
                                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                    <span className="text-xs font-semibold text-emerald-700">{completionPct}% done</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {sortedModuleList.map((mod, idx) => (
                                                <ModuleRow key={mod.id} mod={mod} idx={idx} progress={progress} onStart={handleModuleClick} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ROADMAP TAB */}
                                {activeTab === 'roadmap' && (
                                    <motion.div key="roadmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <ModuleRoadmap modules={roadmapModules} onModuleClick={handleModuleClick} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* RIGHT: sticky card */}
                        <div>
                            <CourseCard
                                course={course}
                                progress={progress}
                                durationLabel={durationLabel}
                                totalLessonCount={totalLessonCount}
                                totalXpDisplay={totalXpDisplay}
                                sortedModuleList={sortedModuleList}
                                onStart={handleStartCourse}
                                onBookmark={() => setBookmarked((p) => !p)}
                                bookmarked={bookmarked}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseDetailsPage;