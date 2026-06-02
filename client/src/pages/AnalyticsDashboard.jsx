import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';
import {
    BarChart3, TrendingUp, Zap, Clock, Award, Flame,
    BookOpen, Target, Calendar, CheckCircle2
} from 'lucide-react';
import { useSidebarOpen } from '../hooks/useSidebarOpen';

const AnalyticsDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [timeRange, setTimeRange] = useState('week');

    // Mock analytics data
    const analytics = {
        totalXP: 3250,
        level: 4,
        coursesCompleted: 2,
        coursesEnrolled: 5,
        currentStreak: 12,
        longestStreak: 25,
        avgQuizScore: 82,
        totalLessonsCompleted: 24,
        averageDailyTime: '45 min',
        weeklyGoalProgress: 75,
    };

    const weeklyData = [
        { day: 'Mon', xp: 150, lessons: 2 },
        { day: 'Tue', xp: 200, lessons: 3 },
        { day: 'Wed', xp: 180, lessons: 2 },
        { day: 'Thu', xp: 220, lessons: 3 },
        { day: 'Fri', xp: 190, lessons: 2 },
        { day: 'Sat', xp: 240, lessons: 4 },
        { day: 'Sun', xp: 170, lessons: 2 },
    ];

    const courseProgress = [
        { name: 'Budgeting Basics', progress: 100, xp: 500, status: 'completed' },
        { name: 'Stock Market 101', progress: 60, xp: 300, status: 'active' },
        { name: 'Emergency Fund Planning', progress: 40, xp: 200, status: 'active' },
    ];

    const weakTopics = [
        { topic: 'Advanced Investing', score: 65, attempts: 3 },
        { topic: 'Tax Planning', score: 72, attempts: 2 },
        { topic: 'Portfolio Management', score: 68, attempts: 2 },
    ];

    const strongTopics = [
        { topic: 'Budgeting Fundamentals', score: 95, attempts: 1 },
        { topic: 'Emergency Funds', score: 90, attempts: 1 },
        { topic: 'Saving Strategies', score: 88, attempts: 2 },
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.3 }
        })
    };

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

            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                <div className="p-4 lg:p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex flex-wrap items-center gap-2 sm:gap-3">
                                <BarChart3 size={40} className="text-indigo-600" />
                                Learning Analytics
                            </h1>
                            <p className="text-gray-600 mt-2">Track your progress and achievements</p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2">
                            {['week', 'month', 'all'].map(range => (
                                <motion.button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === range
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: Zap, label: 'Total XP', value: analytics.totalXP, color: 'from-yellow-400 to-amber-500' },
                            { icon: TrendingUp, label: 'Level', value: analytics.level, color: 'from-indigo-400 to-purple-500' },
                            { icon: BookOpen, label: 'Lessons Done', value: analytics.totalLessonsCompleted, color: 'from-blue-400 to-cyan-500' },
                            { icon: Award, label: 'Courses', value: analytics.coursesCompleted, color: 'from-green-400 to-emerald-500' },
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={i}
                                    custom={i}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold opacity-90">{stat.label}</p>
                                            <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                        </div>
                                        <Icon size={32} className="opacity-30" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-8">
                        {/* Streak & Goal */}
                        <motion.div
                            custom={0}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-1"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                                {/* Streak */}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                                        <Flame size={18} className="text-orange-600" />
                                        Learning Streak
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-orange-600">{analytics.currentStreak}</span>
                                            <span className="text-gray-600 text-sm">days</span>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Personal best: {analytics.longestStreak} days
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200" />

                                {/* Weekly Goal */}
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                                        <Target size={18} className="text-blue-600" />
                                        Weekly Goal
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-end gap-2">
                                            <div className="text-2xl font-bold text-blue-600">{analytics.weeklyGoalProgress}%</div>
                                            <span className="text-xs text-gray-600">Complete</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-linear-to-r from-blue-500 to-indigo-600"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${analytics.weeklyGoalProgress}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Weekly Activity Chart */}
                        <motion.div
                            custom={1}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-2"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-600" />
                                    Weekly Activity
                                </h3>
                                <div className="flex items-end justify-around h-64 gap-2">
                                    {weeklyData.map((day, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex flex-col items-center gap-1 flex-1"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative flex-1">
                                                <motion.div
                                                    className="w-full h-full bg-linear-to-t from-indigo-500 to-indigo-400 rounded-t-lg"
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(day.xp / 250) * 100}%` }}
                                                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600 opacity-0 hover:opacity-100 transition-opacity bg-white/50">
                                                    {day.lessons} L
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600">{day.day}</span>
                                            <span className="text-xs text-gray-500">{day.xp} XP</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Course Progress */}
                        <motion.div
                            custom={2}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-600" />
                                    Course Progress
                                </h3>
                                <div className="space-y-4">
                                    {courseProgress.map((course, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="pb-4 border-b border-gray-100 last:border-0"
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900 text-sm">{course.name}</h4>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${course.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {course.status === 'completed' ? '✓ Done' : 'In Progress'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                                                    <motion.div
                                                        className="h-full bg-indigo-600"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.progress}%` }}
                                                        transition={{ duration: 0.6 }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">{course.progress}%</span>
                                            </div>
                                            <p className="text-xs text-gray-500">+{course.xp} XP</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Topics Analysis */}
                        <motion.div
                            custom={3}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-6">Strong & Weak Topics</h3>

                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 text-green-700">✓ Strong Topics</h4>
                                    <div className="space-y-2">
                                        {strongTopics.map((topic, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">{topic.topic}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500" style={{ width: `${topic.score}%` }} />
                                                    </div>
                                                    <span className="font-bold text-green-600">{topic.score}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 text-orange-700">! Weak Topics</h4>
                                    <div className="space-y-2">
                                        {weakTopics.map((topic, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">{topic.topic}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-orange-500" style={{ width: `${topic.score}%` }} />
                                                    </div>
                                                    <span className="font-bold text-orange-600">{topic.score}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;
