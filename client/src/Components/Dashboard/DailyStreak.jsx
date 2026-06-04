import React, { useState, useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import { Flame, Calendar, Trophy, Zap, CheckCircle2 } from "lucide-react";
import { LinearProgress } from "@mui/material";

/**
 * Returns an array of 7 day-objects for the current week (Mon–Sun).
 */
function getWeekDays() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { label, date: d, isToday, isPast, isFuture: !isToday && !isPast };
  });
}

const DailyStreak = ({
  streak = 0,
  longestStreak = 0,
  todayProgress = 0,
  lessonsThisWeek = 0,
  weeklyGoal = 3,
}) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const flameControls = useAnimation();

  const weekDays = useMemo(() => getWeekDays(), []);
  const isGoalMet = lessonsThisWeek >= weeklyGoal;

  const [particlePositions] = useState(() =>
    [...Array(8)].map(() => ({
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }))
  );

  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const factor = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - factor, 3);
      setAnimatedStreak(Math.floor(streak * eased));
      if (factor < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [streak]);

  useEffect(() => {
    const duration = 1000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const factor = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - factor, 3);
      setAnimatedProgress(Math.floor(todayProgress * eased));
      if (factor < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [todayProgress]);

  useEffect(() => {
    let cancelled = false;
    const grow = async () => {
      while (!cancelled) {
        await flameControls.start({
          scale: [1, 1.4, 1],
          color: ["#f97316", "#dc2626", "#f97316"],
          filter: [
            "drop-shadow(0 0 0 rgba(249, 115, 22, 0))",
            "drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))",
            "drop-shadow(0 0 0 rgba(249, 115, 22, 0))",
          ],
          transition: { duration: 3, ease: "easeInOut" },
        });
        if (cancelled) break;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    };
    grow();
    return () => { cancelled = true; };
  }, [flameControls]);

  useEffect(() => {
    if (isGoalMet) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isGoalMet]);

  const activeDayCount = Math.min(lessonsThisWeek, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015, y: -3 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-4 sm:p-5 relative overflow-hidden"
    >
      {/* Celebration particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: pos.x,
                y: pos.y,
              }}
              transition={{ duration: 1.5, delay: i * 0.08 }}
              className="absolute left-1/2 top-1/2 text-xl sm:text-2xl"
            >
              {i % 2 === 0 ? "✨" : "🔥"}
            </motion.div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.div animate={flameControls} className="relative">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
          </motion.div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daily Streak</h2>
        </div>
        <motion.div
          animate={{ rotate: showCelebration ? 360 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
        </motion.div>
      </div>

      {/* Streak counter */}
      <div className="text-center mb-4 sm:mb-5">
        <motion.div
          key={animatedStreak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-4xl sm:text-5xl font-bold text-orange-600 mb-0.5"
        >
          {animatedStreak}
        </motion.div>
        <p className="text-xs sm:text-sm text-gray-600">
          {streak === 0
            ? "Complete a lesson to start your streak!"
            : `${streak} day${streak === 1 ? "" : "s"} in a row`}
        </p>
      </div>

      {/* Week day indicators */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 px-0.5">
        {weekDays.map((day, i) => {
          const isActive = i < activeDayCount;
          return (
            <div key={day.label} className="flex flex-col items-center gap-0.5 sm:gap-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300 }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-colors ${day.isToday
                    ? isActive
                      ? "bg-orange-500 text-white ring-2 ring-orange-300"
                      : "bg-orange-100 text-orange-600 ring-2 ring-orange-300"
                    : isActive
                      ? "bg-green-500 text-white"
                      : day.isPast
                        ? "bg-gray-200 text-gray-400"
                        : "bg-gray-100 text-gray-400"
                  }`}
              >
                {isActive && !day.isToday ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  day.label.charAt(0)
                )}
              </motion.div>
              <span className={`text-[9px] sm:text-[10px] ${day.isToday ? "font-bold text-orange-600" : "text-gray-500"}`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Weekly progress */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            This week&apos;s lessons
          </span>
          <motion.span
            key={animatedProgress}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-xs sm:text-sm font-semibold ${isGoalMet ? "text-green-600" : "text-orange-600"}`}
          >
            {lessonsThisWeek}/{weeklyGoal}
          </motion.span>
        </div>
        <div className="relative">
          <LinearProgress
            variant="determinate"
            value={Math.min(100, animatedProgress)}
            sx={{
              height: 7,
              borderRadius: 4,
              backgroundColor: "#fed7aa",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor: isGoalMet ? "#22c55e" : "#f97316",
              },
            }}
          />
          {isGoalMet && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
            >
              <Zap className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-orange-200">
        <motion.div whileHover={{ scale: 1.05 }} className="text-center px-1">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{longestStreak}</div>
          <p className="text-[10px] sm:text-xs text-gray-500">Best Streak</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg sm:text-2xl"
          >
            🔥
          </motion.div>
          <p className="text-[10px] sm:text-xs text-gray-500">Keep Going!</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="text-center px-1">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{lessonsThisWeek}</div>
          <p className="text-[10px] sm:text-xs text-gray-500">This Week</p>
        </motion.div>
      </div>

      {/* Status message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg border ${isGoalMet ? "bg-green-50 border-green-200" : "bg-white border-orange-200"
          }`}
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {isGoalMet ? (
            <>
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
              <span className="text-green-700 font-medium">
                Weekly goal complete! Great job! 🎉
              </span>
            </>
          ) : (
            <>
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
              <span className="text-gray-700">
                {lessonsThisWeek} lesson{lessonsThisWeek === 1 ? "" : "s"} toward your goal
                {weeklyGoal - lessonsThisWeek > 0 && ` — ${weeklyGoal - lessonsThisWeek} more to go!`}
              </span>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DailyStreak;
