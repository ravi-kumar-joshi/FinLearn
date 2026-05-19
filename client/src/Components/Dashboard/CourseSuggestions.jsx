import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import { Button, Chip } from "@mui/material";

const CourseSuggestions = ({
  suggestions = [],
  loading = false,
  onViewAll,
  onSelectCourse,
}) => {
  const emojiControls = useAnimation();

  useEffect(() => {
    const grow = async () => {
      while (true) {
        await emojiControls.start({
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 2.5, ease: "easeInOut" },
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    };
    grow();
  }, [emojiControls]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Suggested Courses</h2>
        <Button
          variant="text"
          size="small"
          endIcon={<ArrowRight className="w-4 h-4" />}
          className="text-teal-600!"
          onClick={onViewAll}
        >
          View All
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Loading suggestions…</p>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No open courses to suggest.</p>
          <p className="text-sm text-gray-400 mt-1">Browse the catalog to start learning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => onSelectCourse?.(course.id)}
              className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <motion.div animate={emojiControls} className="text-4xl">
                {course.image}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  </div>
                  <Chip
                    label={course.level}
                    size="small"
                    className="bg-teal-50! text-teal-700! border-teal-200!"
                  />
                </div>
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <span className="text-teal-600 font-medium">{course.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSuggestions;
