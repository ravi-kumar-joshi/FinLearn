import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Dashboard/Navbar';
import httpAction from '../utils/httpAction';
import { COURSE_PROGRESS_UPDATED } from '../utils/courseProgressEvents';
import SideBar from '../Components/Dashboard/SideBar';
import {
  Star, Clock, Users, BookOpen, TrendingUp, Shield,
  PieChart, Landmark, Wallet, Lock, Zap, Trophy,
  Flame, CheckCircle2, Search, ChevronLeft, ChevronRight,
  PlayCircle, ArrowRight, GraduationCap, Target, Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarOpen } from '../hooks/useSidebarOpen';

const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5050' : '/api';
const CATALOG_POLL_MS = 30000;

const CATEGORIES = ['All', 'Budgeting', 'Investing', 'Tax', 'Taxes', 'Savings', 'Debt', 'Retirement', 'Banking'];

const CATEGORY_ICONS = {
  Budgeting: Wallet,
  Investing: TrendingUp,
  Tax: Shield,
  Taxes: Shield,
  Savings: Wallet,
  Debt: Landmark,
  Retirement: PieChart,
  Banking: Landmark,
};

const PALETTE = [
  { color: '#10b981', colorLight: '#d1fae5', colorDark: '#065f46' },
  { color: '#6366f1', colorLight: '#ede9fe', colorDark: '#4338ca' },
  { color: '#8b5cf6', colorLight: '#f5f3ff', colorDark: '#5b21b6' },
  { color: '#0ea5e9', colorLight: '#e0f2fe', colorDark: '#0369a1' },
  { color: '#f59e0b', colorLight: '#fef3c7', colorDark: '#92400e' },
  { color: '#f97316', colorLight: '#ffedd5', colorDark: '#9a3412' },
];

function formatDurationMinutes(mins) {
  const n = Number(mins) || 0;
  if (n <= 0) return '—';
  const h = Math.floor(n / 60);
  const m = n % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || `${n} min`;
}

function estimateCourseXp(c) {
  let total = 0;
  for (const mod of c.modules || []) {
    total += Number(mod.xpReward) || 0;
    for (const L of mod.lessons || []) total += Number(L.xpReward) || 0;
  }
  return total || 100;
}

/** Maps GET /courses document + enrollment fields → UI card model (uses real Mongo _id as id). */
function mapApiCourseToCard(c, index) {
  const id = (c._id ?? c.id)?.toString?.() ?? '';
  const modules = c.modules || [];
  const lessonsTotal =
    typeof c.lessonsTotal === 'number'
      ? c.lessonsTotal
      : modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const category = c.category || 'Budgeting';
  const Icon = CATEGORY_ICONS[category] || BookOpen;
  const pal = PALETTE[index % PALETTE.length];
  const progress = Math.min(100, Math.max(0, Number(c.progress) || 0));
  const completed = !!c.completed;
  const enrolled = !!c.enrolled;
  const status = completed ? 'completed' : enrolled ? 'active' : 'available';
  const lessonsDone =
    typeof c.lessonsCompleted === 'number'
      ? Math.min(Math.max(0, c.lessonsCompleted), Math.max(lessonsTotal, 0))
      : lessonsTotal > 0
        ? Math.min(lessonsTotal, Math.round((progress / 100) * lessonsTotal))
        : 0;

  return {
    id,
    title: c.title,
    category,
    level: c.difficulty || 'Beginner',
    rating: c.rating ?? 4.5,
    students: c.totalEnrollments ?? 0,
    duration: formatDurationMinutes(c.duration),
    price: 'Free',
    icon: Icon,
    xp: estimateCourseXp(c),
    status,
    progress,
    lessonsTotal: Math.max(lessonsTotal, 1),
    lessonsDone,
    description: c.description || '',
    color: pal.color,
    colorLight: pal.colorLight,
    colorDark: pal.colorDark,
    enrolled,
    completed,
    xpEarnedFromApi: c.xpEarned || 0,
    isBoss: false,
    unlockHint: null,
  };
}
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const ITEMS_PER_PAGE = 9;

const LEVEL_STYLE = {
  Beginner: { bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  Intermediate: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  Advanced: { bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

// ─── Stat Pill ────────────────────────────────────────────────────────────────

const StatPill = ({ icon, label, value, bg, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    background: bg, borderRadius: 14, padding: '14px 20px',
    border: `1px solid ${color}30`,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ─── Course Card ──────────────────────────────────────────────────────────────

const CourseCard = ({ course, onNavigate }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = course.icon;
  const lvl = LEVEL_STYLE[course.level];
  const isLocked = course.status === 'locked';
  const isDone = course.status === 'completed';
  const isActive = course.status === 'active';
  const isAvailable = course.status === 'available';

  const btnLabel = isDone ? 'Review Course' : isActive ? 'Continue Learning' : isAvailable ? 'Start Learning' : 'Preview';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col h-full bg-white rounded-xl overflow-hidden
        transition-all duration-200
        ${isLocked ? 'opacity-80 cursor-default' : 'cursor-pointer'}
        ${hovered && !isLocked ? '-translate-y-1 shadow-xl' : 'shadow-sm'}
        ${isActive || isAvailable ? 'border-2' : 'border border-gray-200'}
      `}
      style={isActive || isAvailable ? { borderColor: course.color } : {}}
    >
      {/* ── Top accent stripe ── */}
      <div
        className="h-1 shrink-0"
        style={{ background: isLocked ? '#e5e7eb' : course.color }}
      />

      {/* ── Status badge ── */}
      {course.isBoss && (
        <div className="absolute top-4 right-3 flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
          <Trophy size={10} /> BOSS LEVEL
        </div>
      )}
      {isActive && !course.isBoss && (
        <div className="absolute top-4 right-3 bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-violet-200">
          IN PROGRESS
        </div>
      )}
      {isAvailable && !course.isBoss && (
        <div className="absolute top-4 right-3 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
          NOT STARTED
        </div>
      )}
      {isDone && (
        <div className="absolute top-4 right-3 flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 size={10} /> DONE
        </div>
      )}

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-4">

        {/* Icon + Title */}
        <div className="flex gap-3 items-start mb-3">
          <div
            className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: isLocked ? '#f3f4f6' : course.colorLight }}
          >
            {isLocked
              ? <Lock size={18} className="text-gray-400" />
              : <Icon size={20} style={{ color: course.color }} />
            }
          </div>

          <div className={`flex-1 ${course.isBoss || isActive || isAvailable || isDone ? 'pr-16' : ''}`}>
            {/* ✅ Fix 3: title clamped to 2 lines */}
            <p className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
              {course.title}
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className="font-semibold px-2 py-0.5 rounded-full"
                style={{ background: lvl?.bg, color: lvl?.color }}
              >
                {course.level}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">{course.category}</span>
            </div>
          </div>
        </div>

        {/* ✅ Fix 1: Description clamped to 3 lines */}
        <p className={`text-xs leading-relaxed mb-3 line-clamp-3 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
          {course.description}
        </p>

        {/* Unlock hint */}
        {isLocked && course.unlockHint && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-yellow-50 rounded-lg px-3 py-2 mb-3">
            <Lock size={11} className="text-amber-800 shrink-0" />
            {course.unlockHint}
          </div>
        )}

        {/* ✅ Fix 5: Stats row — no wrap */}
        <div className="flex items-center gap-2 mb-3 flex-nowrap overflow-hidden">
          <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />{course.rating}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
            <Clock size={11} />{course.duration}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
            <BookOpen size={11} />{course.lessonsTotal} lessons
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-auto">
            <Zap size={11} className="text-amber-400 fill-amber-400" />+{course.xp} XP
          </span>
        </div>

        {/* Progress bar (active only) */}
        {isActive && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-400">{course.lessonsDone} of {course.lessonsTotal} done</span>
              <span className="text-xs font-bold" style={{ color: course.color }}>{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%`, background: course.color }}
              />
            </div>
          </div>
        )}

        {/* ✅ Fix 2: Footer pinned to bottom */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-100">
          <span className={`text-base font-extrabold ${course.price === 'Free' ? 'text-emerald-600' : 'text-gray-900'}`}>
            {course.price}
            {course.price !== 'Free' && (
              <span className="text-xs text-gray-400 font-normal ml-1">one-time</span>
            )}
          </span>

          <button
            onClick={() => !isLocked && onNavigate(`/dashboard/course/${course.id}`)}
            disabled={isLocked && !course.unlockHint}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
              shrink-0 transition-opacity duration-150
              ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={!isLocked ? {
              background: isDone ? '#d1fae5' : course.color,
              color: isDone ? '#065f46' : '#fff',
            } : {}}
          >
            {isLocked
              ? <Lock size={12} />
              : isDone
                ? <CheckCircle2 size={12} />
                : <PlayCircle size={12} />
            }
            {isLocked ? 'Locked' : btnLabel}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

// ─── My Journey Card ──────────────────────────────────────────────────────────

const JourneyCard = ({ course, onNavigate, isNext }) => {
  const Icon = course.icon;
  const isDone = course.status === 'completed';
  const isActive = course.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        background: '#fff',
        border: isActive ? `2px solid ${course.color}` : isNext ? '2px dashed #fcd34d' : '1px solid #e5e7eb',
        borderRadius: 14, padding: '14px 16px',
        opacity: (!isDone && !isActive && !isNext) ? 0.55 : 1,
        boxShadow: isActive ? `0 0 0 4px ${course.color}18` : 'none',
      }}
    >
      {/* Step icon */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: isDone ? '#d1fae5' : isActive ? course.color : isNext ? '#fef3c7' : '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: isDone ? '2px solid #10b981' : isActive ? `2px solid ${course.color}` : isNext ? '2px solid #fcd34d' : '2px solid #e5e7eb',
      }}>
        {isDone ? <CheckCircle2 size={18} color="#10b981" />
          : isActive ? <Icon size={18} color="#fff" />
            : isNext ? <ArrowRight size={16} color="#92400e" />
              : <Lock size={15} color="#9ca3af" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isDone || isActive || isNext ? '#111827' : '#9ca3af' }}>
              {isDone || isActive || isNext ? course.title : '???'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {course.lessonsTotal} lessons · {course.duration}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Zap size={12} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>+{course.xp} XP</span>
          </div>
        </div>

        {isActive && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${course.progress}%`,
                background: course.color, borderRadius: 99,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{course.lessonsDone}/{course.lessonsTotal} done</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: course.color }}>{course.progress}%</span>
            </div>
          </div>
        )}

        {isNext && (
          <div style={{
            marginTop: 8, fontSize: 12, color: '#92400e',
            background: '#fef9c3', borderRadius: 8, padding: '6px 10px',
          }}>
            {course.unlockHint || 'Complete the current module to unlock this.'}
          </div>
        )}

        {(isDone || isActive) && (
          <button
            onClick={() => onNavigate(`/dashboard/course/${course.id}`)}
            style={{
              marginTop: 10, padding: '6px 14px', borderRadius: 8, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: isDone ? '#d1fae5' : course.color,
              color: isDone ? '#065f46' : '#fff',
            }}
          >
            {isDone ? 'Review' : 'Continue →'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AllCourses = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [browsePage, setBrowsePage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const catalogSeq = useRef(0);
  const catalogReady = useRef(false);

  const fetchCourses = useCallback(async (silent) => {
    const seq = ++catalogSeq.current;
    if (!silent) setLoadingCourses(true);
    const res = await httpAction({
      url: `${API_BASE_URL}/courses`,
      method: 'GET',
    });
    if (seq !== catalogSeq.current) return;
    if (res?.success && Array.isArray(res.courses)) {
      const mapped = res.courses
        .map((c, i) => mapApiCourseToCard(c, i))
        .filter((c) => /^[0-9a-fA-F]{24}$/.test(c.id));
      setCourses(mapped);
    } else {
      setCourses([]);
    }
    catalogReady.current = true;
    setLoadingCourses(false);
  }, []);

  useEffect(() => {
    catalogReady.current = false;
    fetchCourses(false);
  }, [fetchCourses]);

  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState !== 'visible' || !catalogReady.current) return;
      fetchCourses(true);
    };
    document.addEventListener('visibilitychange', onResume);
    window.addEventListener('focus', onResume);
    return () => {
      document.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('focus', onResume);
    };
  }, [fetchCourses]);

  useEffect(() => {
    const onProgress = () => {
      fetchCourses(true);
    };
    window.addEventListener(COURSE_PROGRESS_UPDATED, onProgress);
    return () => window.removeEventListener(COURSE_PROGRESS_UPDATED, onProgress);
  }, [fetchCourses]);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible' && catalogReady.current) {
        fetchCourses(true);
      }
    }, CATALOG_POLL_MS);
    return () => clearInterval(t);
  }, [fetchCourses]);

  const completedCourses = courses.filter((c) => c.completed);
  const activeCourse =
    courses.find((c) => c.enrolled && !c.completed && (c.progress || 0) > 0 && (c.progress || 0) < 100) ||
    courses.find((c) => c.enrolled && !c.completed);
  const totalXPEarned = courses.reduce((s, c) => s + (c.xpEarnedFromApi || 0), 0);
  const freeCourses = courses.filter((c) => c.price === 'Free').length;

  const firstIncompleteIdx = courses.findIndex((c) => !c.completed);
  const journeyCourses = courses.map((c, i) => ({
    ...c,
    _isNext: i === firstIncompleteIdx && !c.completed,
  }));

  const browseFiltered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchLvl = levelFilter === 'All Levels' || c.level === levelFilter;
    return matchSearch && matchCat && matchLvl;
  });

  const browseTotalPages = Math.ceil(browseFiltered.length / ITEMS_PER_PAGE);
  const browsePaginated = browseFiltered.slice((browsePage - 1) * ITEMS_PER_PAGE, browsePage * ITEMS_PER_PAGE);

  const TABS = [
    { key: 'browse', icon: <BookOpen size={15} />, label: 'All Courses' },
    { key: 'journey', icon: <Target size={15} />, label: 'My Learning Path' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)} />
      )}
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>

        {/* ── Hero: What we offer ── */}
        <motion.div className="relative overflow-hidden px-4 py-8 sm:px-7 sm:py-9" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
        }}>
          {/* decorative circles */}
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', top: -80, right: -60, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', bottom: -60, left: 40, pointerEvents: 'none',
          }} />

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <GraduationCap size={18} color="#a5b4fc" />
              <span style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600 }}>Financial Literacy Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
              Master Your Money,<br />
              <span style={{ color: '#a5b4fc' }}>One Course at a Time</span>
            </h1>
            <p style={{ fontSize: 14, color: '#c7d2fe', marginBottom: 24, maxWidth: 520, lineHeight: 1.6 }}>
              From budgeting basics to advanced investing — learn at your pace, earn XP, and get certified.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Courses', value: courses.length, color: '#a5b4fc', bg: 'rgba(165,180,252,0.12)' },
                { label: 'Free Courses', value: freeCourses, color: '#6ee7b7', bg: 'rgba(110,231,183,0.12)' },
                { label: 'XP Earned', value: `${totalXPEarned}`, color: '#fcd34d', bg: 'rgba(252,211,77,0.12)' },
                { label: 'Completed', value: completedCourses.length, color: '#f9a8d4', bg: 'rgba(249,168,212,0.12)' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: s.bg, borderRadius: 12, padding: '10px 18px',
                  border: `1px solid ${s.color}30`,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Current Course Banner (if active) ── */}
        {activeCourse && (
          <div style={{
            margin: '16px 16px 0',
            background: `linear-gradient(135deg, ${activeCourse.colorLight}, #fff)`,
            border: `1.5px solid ${activeCourse.color}40`,
            borderRadius: 16, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: activeCourse.colorLight,
              border: `2px solid ${activeCourse.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {<activeCourse.icon size={22} color={activeCourse.color} />}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, color: activeCourse.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
                Continue where you left off
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{activeCourse.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {activeCourse.lessonsDone}/{activeCourse.lessonsTotal} lessons · {activeCourse.progress}% complete
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{
                  height: '100%', width: `${activeCourse.progress}%`,
                  background: activeCourse.color, borderRadius: 99,
                }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/course/${activeCourse.id}/player`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: activeCourse.color, color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              }}
            >
              <PlayCircle size={16} /> Resume
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="px-4 sm:px-6 pt-5 border-b border-gray-200 bg-white overflow-x-auto">
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 20px',
                border: 'none',
                borderBottom: tab === t.key ? '2.5px solid #6366f1' : '2.5px solid transparent',
                background: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: tab === t.key ? '#6366f1' : '#6b7280',
                transition: 'all 0.2s',
                borderRadius: '8px 8px 0 0',
              }}>{t.icon}{t.label}
                {t.key === 'journey' && (
                  <span style={{
                    background: '#6366f1', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '2px 7px',
                    borderRadius: 99, marginLeft: 2,
                  }}>{completedCourses.length}/{courses.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">

            {/* ══ TAB: ALL COURSES ══ */}
            {tab === 'browse' && (
              <motion.div key="browse"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              >
                {/* Search + Filter row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 420 }}>
                    <Search size={15} color="#9ca3af" style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    }} />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); setBrowsePage(1); }}
                      style={{
                        width: '100%', paddingLeft: 40, paddingRight: 16,
                        paddingTop: 10, paddingBottom: 10,
                        border: '1.5px solid #e5e7eb', borderRadius: 12,
                        fontSize: 14, outline: 'none', background: '#fff',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(f => !f)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 16px', borderRadius: 12,
                      border: showFilters ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
                      background: showFilters ? '#ede9fe' : '#fff',
                      color: showFilters ? '#4338ca' : '#374151',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Filter size={14} /> Filters
                  </button>
                </div>

                {/* Filter chips */}
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginBottom: 20 }}
                  >
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, alignSelf: 'center' }}>Category:</span>
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => { setCategoryFilter(cat); setBrowsePage(1); }}
                          style={{
                            padding: '5px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600,
                            background: categoryFilter === cat ? '#6366f1' : '#f3f4f6',
                            color: categoryFilter === cat ? '#fff' : '#374151',
                          }}>{cat}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, alignSelf: 'center' }}>Level:</span>
                      {LEVELS.map(lvl => (
                        <button key={lvl} onClick={() => { setLevelFilter(lvl); setBrowsePage(1); }}
                          style={{
                            padding: '5px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600,
                            background: levelFilter === lvl ? '#6366f1' : '#f3f4f6',
                            color: levelFilter === lvl ? '#fff' : '#374151',
                          }}>{lvl}</button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Results count */}
                {!loadingCourses && (
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>
                    Showing <strong style={{ color: '#111827' }}>{browseFiltered.length}</strong> of {courses.length}{' '}
                    courses
                    {categoryFilter !== 'All' && (
                      <>
                        {' '}
                        in <strong style={{ color: '#6366f1' }}>{categoryFilter}</strong>
                      </>
                    )}
                  </p>
                )}

                {/* Course grid */}
                {loadingCourses ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6b7280' }}>
                    Loading courses…
                  </div>
                ) : browsePaginated.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280', maxWidth: 420, margin: '0 auto' }}>
                    <Search size={36} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
                      {courses.length === 0 ? 'No courses in the database yet' : 'No courses match your filters'}
                    </div>
                    <div style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
                      {courses.length === 0 ? (
                        <>
                          Seed demo lessons with MongoDB connected: from the{' '}
                          <code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 6 }}>
                            server
                          </code>{' '}
                          folder run{' '}
                          <code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 6 }}>
                            npm run seed
                          </code>
                          .
                        </>
                      ) : (
                        <>Try clearing search or switching category / level filters.</>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 18, marginBottom: 28,
                  }}>
                    {browsePaginated.map((c, i) => (
                      <motion.div key={c.id} transition={{ delay: i * 0.04 }}>
                        <CourseCard course={c} onNavigate={navigate} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {browseTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button onClick={() => setBrowsePage(p => Math.max(1, p - 1))} disabled={browsePage === 1}
                      style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: '1px solid #e5e7eb', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: browsePage === 1 ? 'not-allowed' : 'pointer',
                        opacity: browsePage === 1 ? 0.4 : 1,
                      }}>
                      <ChevronLeft size={14} color="#374151" />
                    </button>
                    {Array.from({ length: browseTotalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setBrowsePage(page)} style={{
                        width: 36, height: 36, borderRadius: 9, border: '1px solid',
                        borderColor: browsePage === page ? '#6366f1' : '#e5e7eb',
                        background: browsePage === page ? '#6366f1' : '#fff',
                        color: browsePage === page ? '#fff' : '#374151',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>{page}</button>
                    ))}
                    <button onClick={() => setBrowsePage(p => Math.min(browseTotalPages, p + 1))} disabled={browsePage === browseTotalPages}
                      style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: '1px solid #e5e7eb', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: browsePage === browseTotalPages ? 'not-allowed' : 'pointer',
                        opacity: browsePage === browseTotalPages ? 0.4 : 1,
                      }}>
                      <ChevronRight size={14} color="#374151" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ TAB: MY LEARNING PATH ══ */}
            {tab === 'journey' && (
              <motion.div key="journey"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              >
                {/* Progress summary */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 14, marginBottom: 28,
                }}>
                  <StatPill
                    icon={<CheckCircle2 size={18} color="#10b981" />}
                    label="Courses completed" value={completedCourses.length}
                    bg="#f0fdf4" color="#16a34a"
                  />
                  <StatPill
                    icon={<Zap size={18} color="#f59e0b" fill="#f59e0b" />}
                    label="XP earned" value={`${totalXPEarned} XP`}
                    bg="#fffbeb" color="#b45309"
                  />
                  <StatPill
                    icon={<Flame size={18} color="#ef4444" fill="#ef4444" />}
                    label="Day streak" value="7 days"
                    bg="#fff1f2" color="#dc2626"
                  />
                  <StatPill
                    icon={<Trophy size={18} color="#6366f1" />}
                    label="Badges earned" value="1"
                    bg="#f5f3ff" color="#7c3aed"
                  />
                </div>

                {/* Path description */}
                <div style={{
                  background: '#fff', borderRadius: 14, padding: '16px 20px',
                  border: '1px solid #e5e7eb', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <Target size={20} color="#6366f1" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Your Recommended Learning Path</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                      Courses are ordered from beginner to advanced. Complete each to unlock the next.
                    </div>
                  </div>
                </div>

                {/* Journey list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {journeyCourses.map((c) => (
                    <JourneyCard
                      key={c.id}
                      course={c}
                      onNavigate={navigate}
                      isNext={c._isNext}
                    />
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default AllCourses;