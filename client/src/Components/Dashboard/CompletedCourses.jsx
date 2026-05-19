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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Completed Courses</h2>
        </div>
        <span className="text-sm font-semibold text-teal-600">
          {completedCourses.length} courses
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm py-8 text-center">Loading…</p>
      ) : completedCourses.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No completed courses yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Finish a course to see it here</p>
          <Button variant="contained" className="bg-indigo-600!" onClick={onBrowse}>
            Browse courses
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {course.completedDate
                      ? `Completed on ${new Date(course.completedDate).toLocaleDateString()}`
                      : "Completed"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {course.certificate && (
                  <Button
                    variant="outlined"
                    size="small"
                    className="border-yellow-400! text-yellow-600!"
                    startIcon={<Award className="w-4 h-4" />}
                    onClick={() => onOpenCertificate?.(course.id)}
                  >
                    Certificate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedCourses;
