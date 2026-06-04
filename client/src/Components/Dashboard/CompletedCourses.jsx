import React from "react";
import { CheckCircle, Award, BookOpen } from "lucide-react";
import { Button } from "@mui/material";

const CompletedCourses = ({
  completedCourses = [],
  loading = false,
  onOpenCertificate,
  onBrowse,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Completed
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
          {completedCourses.length}
        </span>
      </div>

      {/* States */}
      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Loading…</p>
      ) : completedCourses.length === 0 ? (
        <div className="text-center py-8 px-4">
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm sm:text-base">No completed courses yet</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 mb-4">
            Finish a course to see it here
          </p>
          <Button
            variant="contained"
            size="small"
            className="bg-indigo-600!"
            onClick={onBrowse}
          >
            Browse courses
          </Button>
        </div>
      ) : (
        /* Scrollable list — caps at ~3 items visible, then scrolls */
        <div className="space-y-2.5 sm:space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {completedCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-gray-100 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              {/* Left: icon + info */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                      {course.title}
                    </h3>
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                    {course.completedDate
                      ? new Date(course.completedDate).toLocaleDateString()
                      : "Completed"}
                  </p>
                </div>
              </div>

              {/* Right: certificate button */}
              {course.certificate && (
                <div className="shrink-0">
                  <Button
                    variant="outlined"
                    size="small"
                    className="border-yellow-400! text-yellow-600! text-[10px] sm:text-xs whitespace-nowrap"
                    startIcon={<Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    onClick={() => onOpenCertificate?.(course.id)}
                  >
                    Certificate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedCourses;
