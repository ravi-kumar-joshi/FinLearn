import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';
import { QuestionCard, QuizProgressBar } from '../Components/Shared/QuizComponents';
import { XPReward } from '../Components/Shared/GamificationComponents';
import httpAction from '../utils/httpAction';
import { notifyCourseProgressUpdated } from '../utils/courseProgressEvents';
import { collectModuleQuizQuestions } from '../utils/moduleQuizQuestions';
import { ArrowLeft, Trophy, Zap, CheckCircle2, Target, BookOpen, ChevronRight } from 'lucide-react';
import { useSidebarOpen } from '../hooks/useSidebarOpen';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finlearn-1.onrender.com';
const PASS_SCORE = 70;

/* ── shared page shell ── */
function Shell({ sidebarOpen, setSidebarOpen, children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}
            <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                {children}
            </main>
        </div>
    );
}

/* ── step indicator ── */
function StepDots({ current, total }) {
    return (
        <div className="flex items-center gap-1.5 justify-center my-4">
            {Array.from({ length: total }).map((_, i) => (
                <motion.div key={i}
                    className={`rounded-full transition-all duration-300 ${i < current ? 'bg-indigo-500 w-2 h-2'
                            : i === current ? 'bg-indigo-600 w-4 h-2'
                                : 'bg-gray-200 w-2 h-2'
                        }`}
                    layout
                />
            ))}
        </div>
    );
}

const QuizPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [totalXP, setTotalXP] = useState(0);
    const [showXP, setShowXP] = useState(false);
    const [xpGained, setXpGained] = useState(0);

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
        load();
        return () => { cancelled = true; };
    }, [courseId]);

    const moduleIdQuery = params.get('moduleId');
    const module = useMemo(() => {
        if (!course?.modules?.length) return null;
        if (moduleIdQuery) return course.modules.find((m) => m.id === moduleIdQuery) || null;
        return course.modules[0];
    }, [course, moduleIdQuery]);

    const questions = useMemo(() => collectModuleQuizQuestions(module), [module]);

    useEffect(() => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowFeedback(false);
    }, [module?.id]);

    const question = questions[currentQuestion];
    const answered = selectedAnswers[currentQuestion] !== undefined && selectedAnswers[currentQuestion] !== null;

    const handleAnswer = (optionIdx) => {
        if (answered) return;
        setSelectedAnswers((prev) => ({ ...prev, [currentQuestion]: optionIdx }));
        const isCorrect = optionIdx === question.correctAnswer;
        const xpEarned = isCorrect ? 40 : 10;
        setXpGained(xpEarned);
        setTotalXP((prev) => prev + xpEarned);
        setShowFeedback(true);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 1500);
    };

    const handleNextQuestion = async () => {
        if (!questions.length || !courseId || !module) return;
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((q) => q + 1);
            setShowFeedback(false);
            return;
        }
        const correctCount = questions.reduce((n, q, idx) => (selectedAnswers[idx] === q.correctAnswer ? n + 1 : n), 0);
        const scorePct = Math.round((correctCount / questions.length) * 100);
        if (scorePct >= PASS_SCORE) {
            const res = await httpAction({
                url: `${API_BASE_URL}/courses/${courseId}/module/${module.id}/complete`,
                method: 'PUT',
                body: { quizScore: scorePct },
            });
            if (res?.progress) { setProgress(res.progress); notifyCourseProgressUpdated(courseId); }
        }
        navigate(`/dashboard/course/${courseId}/quiz-result`, {
            state: { selectedAnswers, totalXP, correctCount, totalQuestions: questions.length, quizScorePct: scorePct, moduleTitle: module.title, modulePassed: scorePct >= PASS_SCORE },
        });
    };

    /* ── loading ── */
    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-500 text-sm font-medium animate-pulse">Loading quiz…</p>
        </div>
    );

    /* ── no course ── */
    if (!course || !module) return (
        <Shell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
                <div className="text-5xl">🔍</div>
                <p className="text-gray-700 font-semibold">Course or module not found.</p>
                <button type="button" onClick={() => navigate('/dashboard/all-courses')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-200">
                    All courses
                </button>
            </div>
        </Shell>
    );

    /* ── no questions ── */
    if (!questions.length) {
        const modProgress = progress?.modules?.find((m) => m.moduleId === module.id);
        const allLessonsDone = module.lessons?.length > 0 &&
            module.lessons.every((l) => modProgress?.lessons?.find((lp) => lp.lessonId === l.id && lp.completed));
        return (
            <Shell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
                        <BookOpen size={36} className="text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">No quiz yet</h1>
                    <p className="text-gray-500 leading-relaxed">
                        No multiple-choice questions are defined for <strong className="text-gray-700">{module.title}</strong> yet.
                        {!allLessonsDone && ' Finish each lesson first, then return here.'}
                    </p>
                    {allLessonsDone && !modProgress?.quizPassed && (
                        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200"
                            onClick={async () => {
                                const res = await httpAction({
                                    url: `${API_BASE_URL}/courses/${courseId}/module/${module.id}/complete`,
                                    method: 'PUT', body: { quizScore: 100 },
                                });
                                if (res?.progress) { setProgress(res.progress); notifyCourseProgressUpdated(courseId); }
                                navigate(`/dashboard/course/${courseId}/player`);
                            }}>
                            Complete module
                        </motion.button>
                    )}
                    <button type="button" className="block mx-auto text-indigo-600 font-semibold text-sm hover:underline"
                        onClick={() => navigate(`/dashboard/course/${courseId}/lesson/${encodeURIComponent(module.id)}`)}>
                        ← Back to lessons
                    </button>
                </div>
            </Shell>
        );
    }

    /* ── already passed ── */
    const modProg = progress?.modules?.find((m) => m.moduleId === module.id);
    if (modProg?.quizPassed) return (
        <Shell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
                    <CheckCircle2 size={44} className="text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900">Already passed! 🎉</h1>
                <p className="text-gray-500">You scored <strong className="text-emerald-600">{modProg.quizScore ?? '—'}%</strong> on {module.title}</p>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/dashboard/course/${courseId}/player`)}
                    className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200">
                    Continue course
                </motion.button>
            </div>
        </Shell>
    );

    /* ── quiz UI ── */
    const _scorePreview = answered
        ? Math.round((Object.keys(selectedAnswers).filter(k => selectedAnswers[k] === questions[Number(k)]?.correctAnswer).length / questions.length) * 100)
        : 0;

    return (
        <Shell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <div className="p-4 lg:p-8">
                <div className="max-w-2xl mx-auto">

                    {/* header */}
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <motion.button type="button" whileHover={{ x: -3 }}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-4"
                            onClick={() => navigate(`/dashboard/course/${courseId}/lesson/${encodeURIComponent(module.id)}`)}>
                            <ArrowLeft size={16} /> Back to lessons
                        </motion.button>

                        {/* module + quiz badge */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-1">{course.title}</p>
                                <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {questions.length} question{questions.length !== 1 && 's'} · Pass at {PASS_SCORE}% to complete the module
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 shrink-0">
                                <Zap size={16} className="text-amber-500" />
                                <div>
                                    <p className="text-xs text-amber-600">XP so far</p>
                                    <p className="font-extrabold text-amber-800 leading-none">{totalXP}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* progress bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4">
                        <QuizProgressBar current={currentQuestion + 1} total={questions.length} xpEarned={totalXP} />
                        <StepDots current={currentQuestion} total={questions.length} />
                    </div>

                    {/* question card */}
                    <AnimatePresence mode="wait">
                        <motion.div key={currentQuestion}
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                            {/* question header stripe */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">
                                        Question {currentQuestion + 1} of {questions.length}
                                    </span>
                                    {answered && (
                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${selectedAnswers[currentQuestion] === question.correctAnswer
                                                ? 'bg-emerald-400/20 text-emerald-200'
                                                : 'bg-red-400/20 text-red-200'}`}>
                                            {selectedAnswers[currentQuestion] === question.correctAnswer ? '✓ Correct +40 XP' : '✗ Wrong +10 XP'}
                                        </motion.span>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <QuestionCard
                                    question={question}
                                    index={currentQuestion}
                                    total={questions.length}
                                    onAnswer={handleAnswer}
                                    answered={answered}
                                    selectedAnswer={selectedAnswers[currentQuestion]}
                                    showFeedback={showFeedback}
                                />

                                <AnimatePresence>
                                    {answered && showFeedback && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="mt-6 pt-5 border-t border-gray-100">
                                            <motion.button type="button" onClick={handleNextQuestion}
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
                                                {currentQuestion === questions.length - 1
                                                    ? <><Trophy size={18} /> See Results</>
                                                    : <>Next Question <ChevronRight size={18} /></>
                                                }
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* bottom hint */}
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Tip: Read carefully — each correct answer earns <span className="text-amber-600 font-semibold">+40 XP</span>
                    </p>
                </div>
            </div>
            <XPReward amount={xpGained} show={showXP} onComplete={() => setShowXP(false)} />
        </Shell>
    );
};

export default QuizPage;