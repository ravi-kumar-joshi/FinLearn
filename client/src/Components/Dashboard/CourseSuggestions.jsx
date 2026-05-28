import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight, Sparkles } from "lucide-react";

const LEVEL_STYLES = {
  Beginner:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Intermediate: "bg-amber-50  text-amber-700  border border-amber-200",
  Advanced:     "bg-rose-50   text-rose-700   border border-rose-200",
};

const CourseSuggestions = ({
  suggestions = [],
  loading = false,
  onViewAll,
  onSelectCourse,
}) => {
  const emojiControls = useAnimation();

  useEffect(() => {
    const loop = async () => {
      while (true) {
        await emojiControls.start({
          scale: [1, 1.18, 1],
          rotate: [0, 6, -6, 0],
          transition: { duration: 2.5, ease: "easeInOut" },
        });
        await new Promise((r) => setTimeout(r, 900));
      }
    };
    loop();
  }, [emojiControls]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-teal-500" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Suggested Courses
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors group"
        >
          View All
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-4 sm:px-6 py-4">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <p className="text-gray-400 text-xs">Loading suggestions…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && suggestions.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No courses to suggest yet.</p>
            <p className="text-gray-400 text-xs mt-1">Browse the catalog to start learning.</p>
          </div>
        )}

        {/* List */}
        {!loading && suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectCourse?.(course.id)}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer group"
              >
                {/* Emoji */}
                <motion.div
                  animate={emojiControls}
                  className="text-2xl sm:text-3xl shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-white transition-colors"
                >
                  {course.image}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug truncate">
                      {course.title}
                    </h3>
                    {/* Level chip — hidden on very small screens */}
                    <span
                      className={`hidden xs:inline-flex shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        LEVEL_STYLES[course.level] ?? "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {course.level}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] sm:text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {course.students?.toLocaleString()}
                    </span>
                    <span className="text-teal-600 font-medium">{course.category}</span>
                    {/* Show level inline on tiny screens */}
                    <span className="xs:hidden text-gray-500 font-medium">{course.level}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={14}
                  className="shrink-0 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all hidden sm:block"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSuggestions;