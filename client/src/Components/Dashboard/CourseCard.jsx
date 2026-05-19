import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ value, color }) => (
  <div className="mt-2">
    <div className="flex justify-between text-[10px] mb-1">
      <span className="text-gray-500 font-medium">Progress</span>
      <span style={{ color }} className="font-bold">{value}%</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
);

const StatusButton = ({ status }) => {
  const styles = {
    completed: "bg-green-500 text-white",
    active: "bg-indigo-600 text-white shadow-md shadow-indigo-200",
    locked: "bg-gray-100 text-gray-400"
  };

  return (
    <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${styles[status]} hover:scale-110 active:scale-95`}>
      {status === "completed" && <span className="text-sm font-bold">✓</span>}
      {status === "active" && <span className="text-xs">▶</span>}
      {status === "locked" && <span className="text-xs">🔒</span>}
    </button>
  );
};

export default function CourseCard({ course, onClick }) {
  const {
    title,
    description,
    progress,
    status,
    color = "#6366f1" // Default brand color
  } = course;

  const isLocked = status === "locked";

  return (
    <motion.div
      whileHover={!isLocked ? { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={`relative flex items-center gap-4 p-4 rounded-2xl bg-white border transition-all cursor-pointer
      ${status === "active" ? "border-indigo-100 ring-1 ring-indigo-50" : "border-gray-100"}
      ${isLocked ? "opacity-60 grayscale cursor-not-allowed" : "hover:border-indigo-200"}
    `}>

      {/* Accent Line */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ background: color }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm truncate">{title}</h3>
        <p className="text-[11px] text-gray-500 line-clamp-1 mb-1">{description}</p>

        {!isLocked ? (
          <ProgressBar value={progress || 0} color={color} />
        ) : (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
            LOCKED
          </span>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0">
        <StatusButton status={status} />
      </div>
    </motion.div>
  );
}