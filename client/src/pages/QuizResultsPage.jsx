import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';
import { Award, Trophy, Zap, Target, TrendingUp, Gift, CheckCircle2, BarChart3, Share2, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import Confetti from '../Components/Dashboard/Confetti';
import httpAction from '../utils/httpAction';
import { useSidebarOpen } from '../hooks/useSidebarOpen';

/* ── animated count-up ── */
function CountUp({ to, duration = 1200, suffix = '' }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const start = performance.now();
        const step = (ts) => {
            const pct = Math.min((ts - start) / duration, 1);
            setVal(Math.round(pct * to));
            if (pct < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [to, duration]);
    return <>{val}{suffix}</>;
}

/* ── score arc ── */
function ScoreArc({ score }) {
    const size = 160, stroke = 12, r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : '#ef4444';
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
                strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            />
        </svg>
    );
}

const PASS_SCORE = 70;

const QuizResultsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [showConfetti, setShowConfetti] = useState(false);
    const [copied, setCopied] = useState(false);

    const state = location.state || {};
    const [searchParams] = useSearchParams();
    const resolvedModuleId = state.moduleId || searchParams.get('moduleId');
    const totalXP = state.totalXP || 0;
    const correctCount = state.correctCount ?? 0;
    const totalQuestions = state.totalQuestions ?? 0;
    const score = state.quizScorePct != null ? state.quizScorePct : Math.round((correctCount / Math.max(totalQuestions, 1)) * 100);
    const moduleTitle = state.moduleTitle || 'Module';
    const passed = score >= PASS_SCORE;

    useEffect(() => {
        if (passed) setTimeout(() => setShowConfetti(true), 400);
    }, [passed]);

    const badge = score === 100
        ? { name: 'Perfect Score', desc: 'Flawless execution!', icon: Trophy, from: 'from-yellow-400', to: 'to-amber-500', glow: 'shadow-amber-200' }
        : score >= 80
            ? { name: 'Expert', desc: 'Outstanding result!', icon: Award, from: 'from-purple-500', to: 'to-indigo-500', glow: 'shadow-indigo-200' }
            : score >= PASS_SCORE
                ? { name: 'Learner', desc: 'Well done, keep going!', icon: Target, from: 'from-blue-400', to: 'to-cyan-500', glow: 'shadow-cyan-200' }
                : null;

    const message = score === 100 ? '🔥 Perfect! Absolute mastery!'
        : score >= 80 ? '🎉 Excellent work!'
            : score >= PASS_SCORE ? '👏 You passed!'
                : '💪 So close — you\'ve got this!';

    const handleShare = () => {
        const text = `I scored ${score}% on the "${moduleTitle}" quiz! 🎓 #FinLearn`;
        navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };

    const scoreColor = score >= 80 ? 'text-emerald-600' : score >= PASS_SCORE ? 'text-indigo-600' : 'text-red-500';

    const [course, setCourse] = useState(null);
    const [nextModuleId, setNextModuleId] = useState(null);
    const [isLastModule, setIsLastModule] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const res = await httpAction({ url: `/api/courses/${courseId}`, method: 'GET' });
            if (cancelled) return;
            if (res?.success && res.course) {
                setCourse(res.course);
                const moduleId = resolvedModuleId;
                if (moduleId && Array.isArray(res.course.modules)) {
                    const idx = res.course.modules.findIndex(m => m.id === moduleId);
                    const nextIdx = idx + 1;
                    if (nextIdx < res.course.modules.length) {
                        setNextModuleId(res.course.modules[nextIdx].id);
                        setIsLastModule(false);
                    } else {
                        setNextModuleId(null);
                        setIsLastModule(true);
                    }
                }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [courseId, state.moduleId]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
            <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                <div className="p-4 lg:p-8">
                    {showConfetti && <Confetti />}

                    <div className="max-w-2xl mx-auto space-y-5">

                        {/* back */}
                        <motion.button type="button" whileHover={{ x: -3 }}
                            onClick={() => navigate(`/dashboard/course/${courseId}`)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">
                            <ArrowLeft size={16} /> Back to course
                        </motion.button>

                        {/* hero score card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                            {/* top gradient banner */}
                            <div className={`bg-gradient-to-r ${passed ? 'from-indigo-600 to-purple-600' : 'from-red-500 to-rose-600'} px-8 py-6 text-center`}>
                                <motion.h2 className="text-2xl font-extrabold text-white mb-1"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    {message}
                                </motion.h2>
                                <p className="text-white/75 text-sm">{moduleTitle} Quiz</p>
                            </div>

                            <div className="px-8 py-8 flex flex-col sm:flex-row items-center gap-8">
                                {/* arc score */}
                                <div className="relative shrink-0">
                                    <ScoreArc score={score} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-extrabold ${scoreColor}`}>
                                            <CountUp to={score} suffix="%" />
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium mt-0.5">Score</span>
                                    </div>
                                </div>

                                {/* stats */}
                                <div className="flex-1 space-y-3 w-full">
                                    {[
                                        { label: 'Correct answers', value: `${correctCount} / ${totalQuestions}`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
                                        { label: 'XP earned', value: `+${totalXP}`, icon: Zap, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
                                        { label: 'Pass threshold', value: `${PASS_SCORE}%`, icon: Target, color: passed ? 'text-indigo-600 bg-indigo-50' : 'text-red-500 bg-red-50', border: passed ? 'border-indigo-100' : 'border-red-100' },
                                    ].map((item) => (
                                        <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border ${item.border} bg-white`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                                                    <item.icon size={16} />
                                                </div>
                                                <span className="text-sm text-gray-600">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* pass/fail status bar */}
                            <div className={`mx-6 mb-6 p-3 rounded-xl flex items-center gap-3 ${passed ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                {passed
                                    ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                    : <XCircle size={18} className="text-red-500 shrink-0" />}
                                <p className={`text-sm font-semibold ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {passed ? 'Module unlocked! Great job.' : `Need ${PASS_SCORE}% to pass. You were ${PASS_SCORE - score}% away.`}
                                </p>
                            </div>
                        </motion.div>

                        {/* Prominent continue button for quick navigation */}
                        {passed && (
                            <div className="max-w-2xl mx-auto mt-6 flex justify-center">
                                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        if (nextModuleId) navigate(`/dashboard/course/${courseId}/lesson/${encodeURIComponent(nextModuleId)}`);
                                        else navigate(`/dashboard/course/${courseId}`);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 text-sm">
                                    {nextModuleId ? 'Continue to next module' : 'Finish course'}
                                </motion.button>
                            </div>
                        )}

                        {/* badge unlock */}
                        <AnimatePresence>
                            {badge && (
                                <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <div className="flex items-center gap-5">
                                        <motion.div
                                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.from} ${badge.to} flex items-center justify-center shadow-lg ${badge.glow} shrink-0`}
                                            animate={{ rotate: [0, -5, 5, -3, 0] }}
                                            transition={{ duration: 0.6, delay: 1.2 }}>
                                            <badge.icon size={30} className="text-white" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-0.5">Badge Unlocked!</p>
                                            <h3 className="text-xl font-bold text-gray-900">{badge.name}</h3>
                                            <p className="text-gray-500 text-sm">{badge.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* review topics (if failed) */}
                        {!passed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                                    <Target size={16} className="text-orange-500" /> Topics to review
                                </h3>
                                <p className="text-sm text-gray-600">Go back to the lesson content and revisit the areas where you were unsure — then retry the quiz.</p>
                            </motion.div>
                        )}

                        {/* action buttons */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                            className="grid sm:grid-cols-2 gap-3">
                            {passed ? (
                                <>
                                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate(`/dashboard/course/${courseId}/certificate`)}
                                        className="py-3.5 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm">
                                        <Gift size={18} className="text-indigo-500" /> Claim Certificate
                                    </motion.button>
                                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            if (nextModuleId) navigate(`/dashboard/course/${courseId}/lesson/${encodeURIComponent(nextModuleId)}`);
                                            else navigate(`/dashboard/course/${courseId}`);
                                        }}
                                        className="py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 text-sm">
                                        <TrendingUp size={18} /> {nextModuleId ? 'Next Module' : 'Finish Course'}
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate(-2)}
                                        className="py-3.5 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm">
                                        <BookOpen size={18} className="text-gray-500" /> Review Content
                                    </motion.button>
                                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate(0)}
                                        className="py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 text-sm">
                                        <RefreshCw size={18} /> Retake Quiz
                                    </motion.button>
                                </>
                            )}
                        </motion.div>

                        {/* share */}
                        <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            onClick={handleShare}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                            className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm">
                            <Share2 size={16} />
                            {copied ? '✅ Copied to clipboard!' : 'Share Achievement'}
                        </motion.button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuizResultsPage;