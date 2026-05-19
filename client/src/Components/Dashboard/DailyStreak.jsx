import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Flame, Calendar, Trophy, Zap } from "lucide-react";
import { LinearProgress } from "@mui/material";

const DailyStreak = ({
  streak = 0,
  longestStreak = 0,
  todayProgress = 0,
  lessonsThisWeek = 0,
  weeklyGoal = 3,
}) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const flameControls = useAnimation();

  const [particlePositions] = useState(() =>
    [...Array(6)].map(() => ({
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
      setAnimatedStreak(Math.floor(streak * factor));
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
      setAnimatedProgress(Math.floor(todayProgress * factor));
      if (factor < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [todayProgress]);

  useEffect(() => {
    const grow = async () => {
      while (true) {
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
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    };
    grow();
  }, [flameControls]);

  const handleClaimProgress = () => {
    if (!isClaimed) {
      setIsClaimed(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-6 cursor-pointer relative overflow-hidden"
      onClick={handleClaimProgress}
    >
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: pos.x,
                y: pos.y,
              }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
              className="absolute text-2xl"
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div animate={flameControls} className="relative">
            <Flame className="w-6 h-6 text-orange-500" />
            <motion.div
              animate={flameControls}
              className="absolute inset-0 w-6 h-6 rounded-full bg-orange-400 opacity-0 blur-sm"
              style={{ filter: "blur(4px)" }}
            />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900">Daily Streak</h2>
        </div>
        <motion.div animate={{ rotate: showCelebration ? 360 : 0 }} transition={{ duration: 0.5 }}>
          <Trophy className="w-5 h-5 text-yellow-500" />
        </motion.div>
      </div>

      <div className="text-center mb-6">
        <motion.div
          key={animatedStreak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-5xl font-bold text-orange-600 mb-2"
        >
          {animatedStreak}
        </motion.div>
        <p className="text-sm text-gray-600">Days in a row (saved on your profile)</p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">This week&apos;s lessons</span>
          <motion.span
            key={animatedProgress}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-sm font-semibold text-orange-600"
          >
            {lessonsThisWeek}/{weeklyGoal}
          </motion.span>
        </div>
        <div className="relative">
          <LinearProgress
            variant="determinate"
            value={animatedProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fed7aa",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor: "#f97316",
              },
            }}
          />
          {isClaimed && (
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

      <div className="flex items-center justify-between pt-4 border-t border-orange-200">
        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
          <div className="text-2xl font-bold text-gray-900">{longestStreak}</div>
          <p className="text-xs text-gray-600">Best Streak</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl"
          >
            🔥
          </motion.div>
          <p className="text-xs text-gray-600">Keep Going!</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-3 bg-white rounded-lg border border-orange-200"
      >
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-gray-700">
            {isClaimed
              ? "Great job! Progress claimed! 🎉"
              : `${lessonsThisWeek} lesson${lessonsThisWeek === 1 ? "" : "s"} toward your weekly goal`}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DailyStreak;
