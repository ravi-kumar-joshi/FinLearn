/*
  client/src/context/CourseContext.jsx

  Purpose:
  - Provides course data and progress to components via React Context.
  - Encapsulates data fetching and actions for completing lessons/modules.

  Exposed values (via `useCourse`):
  - `course`: course metadata
  - `progress`: user's progress object for the course
  - `loading`: boolean loading state while fetching
  - `error`: error message if fetch fails
  - `fetchCourse`: function to re-fetch course data
  - `completeLesson(lessonId, xpEarned, score)`: marks a lesson complete
  - `completeModule(moduleId, quizScore)`: marks a module complete
  - `refreshProgress`: wrapper to refresh progress data
*/

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import httpAction from '../utils/httpAction';
import apis from '../utils/apis';
import { notifyCourseProgressUpdated } from '../utils/courseProgressEvents';

// Optional environment override for API base URL (rarely used here).
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const CourseContext = createContext(null);

// Convenience hook to consume the CourseContext
export const useCourse = () => useContext(CourseContext);

export function CourseProvider({ courseId, children }) {
    // Local state for course metadata and user's progress
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch course and progress from backend. This function is memoized
    // with `useCallback` so it can be safely used in effects or passed down.
    const fetchCourse = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await httpAction({ url: `${apis().getCourseById}/${courseId}` });
            if (res?.success) {
                setCourse(res.course);
                setProgress(res.progress);
            } else {
                setError(res?.message || 'Failed to load course');
            }
        } catch (err) {
            setError(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    // Trigger initial fetch when `courseId` becomes available.
    useEffect(() => {
        if (courseId) fetchCourse();
    }, [courseId, fetchCourse]);

    // Complete a lesson: sends a PUT request to the backend with XP/score
    // and updates local progress state when successful. Also notifies
    // other parts of the app via `notifyCourseProgressUpdated` for realtime UI updates.
    const completeLesson = useCallback(async (lessonId, xpEarned = 20, score) => {
        if (!courseId || !lessonId) return null;
        const res = await httpAction({
            url: `${apis().completeLessonApi}/${courseId}/lesson/${lessonId}/complete`,
            method: 'PUT',
            body: { xpEarned, score },
        });
        if (res?.success && res.progress) {
            setProgress(res.progress);
            notifyCourseProgressUpdated(courseId);
        }
        return res;
    }, [courseId]);

    // Complete a module (usually at module-level quiz completion).
    const completeModule = useCallback(async (moduleId, quizScore = 100) => {
        if (!courseId || !moduleId) return null;
        const res = await httpAction({
            url: `${apis().completeModuleApi}/${courseId}/module/${moduleId}/complete`,
            method: 'PUT',
            body: { quizScore },
        });
        if (res?.success && res.progress) {
            setProgress(res.progress);
            notifyCourseProgressUpdated(courseId);
        }
        return res;
    }, [courseId]);

    const refreshProgress = useCallback(async () => {
        await fetchCourse();
    }, [fetchCourse]);

    return (
        <CourseContext.Provider value={{ course, progress, loading, error, fetchCourse, completeLesson, completeModule, refreshProgress }}>
            {children}
        </CourseContext.Provider>
    );
}

export default CourseContext;
