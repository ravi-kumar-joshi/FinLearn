/** Dispatched when lesson or module progress is saved so catalog/details can refetch. */
export const COURSE_PROGRESS_UPDATED = 'finlearn:course-progress-updated';

export function notifyCourseProgressUpdated(courseId) {
    if (typeof window === 'undefined' || !courseId) return;
    window.dispatchEvent(
        new CustomEvent(COURSE_PROGRESS_UPDATED, { detail: { courseId: String(courseId) } })
    );
}
