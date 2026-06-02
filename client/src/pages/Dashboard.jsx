import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../Components/Dashboard/Navbar";
import CourseSuggestions from "../Components/Dashboard/CourseSuggestions";
import DailyStreak from "../Components/Dashboard/DailyStreak";
import CompletedCourses from "../Components/Dashboard/CompletedCourses";
import Panel from "../Components/Dashboard/Panel";
import CourseCard from "../Components/Dashboard/CourseCard";
import SideBar from "../Components/Dashboard/SideBar";
import { AnimatedXPBar, LevelCard } from "../Components/Dashboard/AnimatedXPBar";
import httpAction from "../utils/httpAction";
import apis from "../utils/apis";
import { COURSE_PROGRESS_UPDATED } from "../utils/courseProgressEvents";
import { useRealtimeXP } from "../hooks/useRealtimeXP.js";
import { useSidebarOpen } from "../hooks/useSidebarOpen";
import LeaderboardClient from "../Components/Home/LeaderboardClient";
import { TrendingUp, BookOpen, Target, Award, Rocket, Shield } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://finlearn-1.onrender.com";
const PALETTE_COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#0ea5e9", "#f59e0b"];

function formatDurationMinutes(mins) {
  const n = Number(mins) || 0;
  if (n <= 0) return "—";
  const h = Math.floor(n / 60);
  const m = n % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(" ") || `${n} min`;
}

/** Maps GET /courses row → dashboard-friendly course model */
function mapApiToDashboardCourse(c, index) {
  const id = (c._id ?? c.id)?.toString?.() ?? "";
  const modules = c.modules || [];
  const lessonsTotal =
    typeof c.lessonsTotal === "number"
      ? c.lessonsTotal
      : modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const progress = Math.min(100, Math.max(0, Number(c.progress) || 0));
  const completed = !!c.completed;
  const enrolled = !!c.enrolled;
  const status = completed ? "completed" : enrolled ? "active" : "locked";
  return {
    id,
    title: c.title,
    description: (c.description || "").slice(0, 160),
    progress,
    status,
    color: PALETTE_COLORS[index % PALETTE_COLORS.length],
    enrolled,
    completed,
    completedAt: c.completedAt,
    certificateIssued: !!c.certificateIssued,
    lessonsTotal,
    category: c.category || "Budgeting",
    level: c.difficulty || "Beginner",
    duration: formatDurationMinutes(c.duration),
    students: c.totalEnrollments ?? 0,
    rating: c.rating ?? 4.5,
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
  const [animatedStats, setAnimatedStats] = useState({
    courses: 0,
    completion: 0,
    achievements: 0,
    streak: 0,
  });
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time user XP (polling)
  const { userData: realtimeUser } = useRealtimeXP(5000);

  const applyProfile = useCallback((res) => {
    if (res?.status && res.user) {
      setUserData(res.user);
      const ls = res.user.leaderboardStats || {};
      setAnimatedStats({
        courses: ls.coursesEnrolled ?? 0,
        completion: ls.completionRate ?? 0,
        achievements: ls.achievementCount ?? 0,
        streak: ls.streak ?? 0,
      });
    }
  }, []);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [profileRes, coursesRes] = await Promise.all([
      httpAction({ url: apis().getUserProfile }),
      httpAction({ url: `${API_BASE_URL}/courses`, method: "GET" }),
    ]);
    applyProfile(profileRes);
    if (coursesRes?.success && Array.isArray(coursesRes.courses)) {
      const mapped = coursesRes.courses
        .map((c, i) => mapApiToDashboardCourse(c, i))
        .filter((c) => /^[0-9a-fA-F]{24}$/.test(c.id));
      setCourses(mapped);
    } else {
      setCourses([]);
    }
    setLoading(false);
  }, [applyProfile]);

  useEffect(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  useEffect(() => {
    const onProg = () => {
      loadDashboardData(true);
    };
    window.addEventListener(COURSE_PROGRESS_UPDATED, onProg);
    return () => window.removeEventListener(COURSE_PROGRESS_UPDATED, onProg);
  }, [loadDashboardData]);

  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState !== "visible") return;
      loadDashboardData(true);
    };
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);
    return () => {
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
    };
  }, [loadDashboardData]);

  const continueCourses = useMemo(() => {
    return courses
      .filter((c) => c.enrolled && !c.completed)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2);
  }, [courses]);

  const suggestedCourses = useMemo(() => {
    return courses
      .filter((c) => !c.completed)
      .slice(0, 3)
      .map((c, i) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        duration: c.duration,
        students: c.students,
        level: c.level,
        category: c.category,
        image: ["📊", "📈", "💳"][i % 3],
      }));
  }, [courses]);

  const completedList = useMemo(() => {
    return courses
      .filter((c) => c.completed)
      .map((c) => ({
        id: c.id,
        title: c.title,
        completedDate: c.completedAt || null,
        certificate: true,
        progress: 100,
      }));
  }, [courses]);

  // Live XP values (prefer realtimeUser when available)
  const liveXP = realtimeUser?.xp || userData?.xp || {};
  const learningXP = liveXP?.learningXP ?? liveXP?.totalXP ?? 0;
  const _levelProgressPct =
    liveXP?.maxXPForLevel && liveXP.maxXPForLevel > 0
      ? Math.min(100, ((liveXP.currentXP || 0) / liveXP.maxXPForLevel) * 100)
      : Math.min(100, (learningXP % 1000) / 10);

  const dashboardMeta = userData?.dashboard;
  const streakDays = userData?.leaderboardStats?.streak ?? 0;

  const stats = [
    {
      label: "Courses Enrolled",
      value: animatedStats.courses,
      icon: BookOpen,
      color: "bg-blue-500",
      change: "From your learning profile",
    },
    {
      label: "Completion Rate",
      value: `${animatedStats.completion}%`,
      icon: Target,
      color: "bg-green-500",
      change: "Of enrolled courses finished",
    },
    {
      label: "Courses Completed",
      value: animatedStats.achievements,
      icon: Award,
      color: "bg-yellow-500",
      change: "Certificates unlocked",
    },
    {
      label: "Learning Streak",
      value: `${animatedStats.streak} days`,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: streakDays > 0 ? "Keep it up!" : "Complete a lesson to start",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
        <div className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Learning Adventure</h1>
            <p className="text-gray-600">Stack XP, unlock badges, and conquer weekly mission goals.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">XP Progress</h2>
                <p className="text-sm opacity-90">
                  Level {liveXP?.level ?? 1} • {learningXP.toLocaleString()} XP from courses
                </p>
              </div>
              <Rocket className="w-6 h-6" />
            </div>

            <div className="mt-4">
              <AnimatedXPBar
                currentXP={liveXP?.currentXP || 0}
                maxXP={liveXP?.maxXPForLevel || Math.max(1000, liveXP?.totalXP || 1000)}
                showLabel={false}
                size="md"
                color="from-white to-white"
              />
            </div>

            <p className="mt-2 text-sm opacity-90">Gain XP by completing lessons and quizzes.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-xs text-teal-600 font-medium">{stat.change}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CourseSuggestions
                suggestions={suggestedCourses}
                loading={loading}
                onViewAll={() => navigate("/dashboard/all-courses")}
                onSelectCourse={(courseId) => navigate(`/dashboard/course/${courseId}`)}
              />

              <Panel title="Continue Learning" className="overflow-hidden">
                {loading ? (
                  <p className="text-gray-500 text-sm py-6 text-center">Loading courses…</p>
                ) : continueCourses.length === 0 ? (
                  <p className="text-gray-500 text-sm py-6 text-center">
                    No courses in progress.{" "}
                    <button
                      type="button"
                      className="text-indigo-600 font-semibold"
                      onClick={() => navigate("/dashboard/all-courses")}
                    >
                      Browse all courses
                    </button>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {continueCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onClick={() => navigate(`/dashboard/course/${course.id}/player`)}
                      />
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Weekly Challenge">
                <p className="text-gray-600 mb-4">
                  Complete {dashboardMeta?.weeklyGoal ?? 3} lessons this week. You&apos;ve finished{" "}
                  <strong>{dashboardMeta?.lessonsCompletedThisWeek ?? 0}</strong> in the last 7 days.
                </p>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardMeta?.weeklyProgressPct ?? 0}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {dashboardMeta?.weeklyProgressPct ?? 0}% of this week&apos;s goal
                </p>
              </Panel>
            </div>

            <div className="space-y-6">
              <DailyStreak
                streak={streakDays}
                longestStreak={streakDays}
                todayProgress={dashboardMeta?.weeklyProgressPct ?? 0}
                lessonsThisWeek={dashboardMeta?.lessonsCompletedThisWeek ?? 0}
                weeklyGoal={dashboardMeta?.weeklyGoal ?? 3}
              />

              {/* Real-time leaderboard (client) */}
              <div>
                <LeaderboardClient />
              </div>

              <CompletedCourses
                completedCourses={completedList}
                loading={loading}
                onOpenCertificate={(courseId) =>
                  navigate(`/dashboard/course/${courseId}/certificate`)
                }
                onBrowse={() => navigate("/dashboard/all-courses")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
