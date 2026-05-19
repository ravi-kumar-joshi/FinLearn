const express = require('express');
const Course = require('../models/Course.js');
const UserProgress = require('../models/UserProgress.js');
const auth = require('../middlewares/auth.js');
const optionalAuth = require('../middlewares/optionalAuth.js');
const { ensureVerificationId } = require('../utils/certificateVerify');

const router = express.Router();

/**
 * Ensure UserProgress exists (same shape as GET /:courseId).
 * Prevents "Progress not found" when PUT runs before GET or enrollment was missing.
 */
async function ensureUserProgress(userId, courseId) {
    let progress = await UserProgress.findOne({ userId, courseId });
    if (progress) return progress;

    const course = await Course.findById(courseId);
    if (!course) return null;

    try {
        return await UserProgress.create({
            userId,
            courseId,
            modules: course.modules.map((m, idx) => ({
                moduleId: m.id,
                unlocked: idx === 0,
                lessons: m.lessons.map((l) => ({ lessonId: l.id })),
            })),
        });
    } catch (err) {
        if (err.code === 11000) {
            return UserProgress.findOne({ userId, courseId });
        }
        throw err;
    }
}

// ─── GET all courses ───────────────────────────────────────────────────────
// Get all courses with user's progress information
router.get('/', optionalAuth, async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).select(
            '-modules.lessons.content -modules.lessons.quiz'
        );

        let progressList = [];
        if (req.id) {
            // Only fetch progress if user is authenticated
            progressList = await UserProgress.find({ userId: req.id });
        }

        const countCompletedLessons = (prog) => {
            if (!prog?.modules?.length) return 0;
            let n = 0;
            for (const m of prog.modules) {
                for (const l of m.lessons || []) {
                    if (l.completed) n += 1;
                }
            }
            return n;
        };

        const enriched = courses.map((c) => {
            const prog = progressList.find((p) =>
                p.courseId.equals(c._id)
            );
            const courseObj = c.toObject();
            const lessonsTotal = (courseObj.modules || []).reduce(
                (sum, m) => sum + (m.lessons?.length || 0),
                0
            );
            return {
                ...courseObj,
                enrolled: !!prog,
                progress: prog?.overallProgress || 0,
                xpEarned: prog?.totalXPEarned || 0,
                completed: prog?.isCompleted || false,
                completedAt: prog?.completedAt || null,
                certificateIssued: prog?.certificateIssued || false,
                lessonsCompleted: prog ? countCompletedLessons(prog) : 0,
                lessonsTotal,
            };
        });

        res.json({ success: true, courses: enriched });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET single course (full content) ─────────────────────────────────────
// Get a specific course with full content and user's progress
router.get('/:courseId', optionalAuth, async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: 'Course not found' });
        }

        let progress = null;
        if (req.id) {
            progress = await UserProgress.findOne({
                userId: req.id,
                courseId,
            });
        }

        // Auto-create progress on first visit (only for authenticated users)
        if (!progress && req.id) {
            progress = await UserProgress.create({
                userId: req.id,
                courseId,
                modules: course.modules.map((m, idx) => ({
                    moduleId: m.id,
                    unlocked: idx === 0,
                    lessons: m.lessons.map((l) => ({ lessonId: l.id })),
                })),
            });
        }

        if (progress?.isCompleted) {
            await ensureVerificationId(progress);
            progress = await UserProgress.findOne({ userId: req.id, courseId });
        }

        res.json({ success: true, course, progress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── PUT complete a lesson ─────────────────────────────────────────────────
// Mark a lesson as completed and award XP
router.put('/:courseId/lesson/:lessonId/complete', auth, async (req, res) => {
    try {
        const userId = req.id; // From auth middleware
        const { courseId, lessonId } = req.params;
        const { xpEarned = 20, score } = req.body;

        if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid course ID' });
        }

        const progress = await ensureUserProgress(userId, courseId);
        if (!progress) {
            return res
                .status(404)
                .json({ success: false, message: 'Course not found' });
        }

        let updated = false;
        for (const mod of progress.modules) {
            const lesson = mod.lessons.find((l) => l.lessonId === lessonId);
            if (lesson && !lesson.completed) {
                lesson.completed = true;
                lesson.completedAt = new Date();
                lesson.xpEarned = xpEarned;
                lesson.attempts = (lesson.attempts || 0) + 1;
                if (score !== undefined) lesson.score = score;
                updated = true;
                break;
            }
        }

        if (updated) {
            const totalLessons = progress.modules.reduce(
                (s, m) => s + m.lessons.length,
                0
            );
            const doneLessons = progress.modules.reduce(
                (s, m) => s + m.lessons.filter((l) => l.completed).length,
                0
            );
            progress.overallProgress = totalLessons
                ? Math.round((doneLessons / totalLessons) * 100)
                : 0;
            progress.totalXPEarned += xpEarned;
            progress.lastAccessedAt = new Date();

            await progress.save();
        }

        res.json({ success: true, progress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── PUT complete a module ─────────────────────────────────────────────────
// Mark a module as completed after quiz pass
router.put(
    '/:courseId/module/:moduleId/complete',
    auth,
    async (req, res) => {
        try {
            const userId = req.id; // From auth middleware
            const { courseId, moduleId } = req.params;
            const { quizScore = 100 } = req.body;

            if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Invalid course ID' });
            }

            const course = await Course.findById(courseId);
            if (!course) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Course not found' });
            }

            const progress = await ensureUserProgress(userId, courseId);
            if (!progress) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Could not create progress' });
            }

            const modProgress = progress.modules.find((m) => m.moduleId === moduleId);
            if (!modProgress) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Module not in progress' });
            }

            const modData = course.modules.find((m) => m.id === moduleId);
            const xpReward = modData?.xpReward || 100;

            modProgress.completed = true;
            modProgress.completedAt = new Date();
            modProgress.quizScore = quizScore;
            modProgress.quizPassed = quizScore >= 70;
            modProgress.xpEarned = (modProgress.xpEarned || 0) + xpReward;
            progress.totalXPEarned += xpReward;

            // Unlock the next module
            const modIndex = progress.modules.findIndex((m) => m.moduleId === moduleId);
            if (modIndex !== -1 && modIndex < progress.modules.length - 1) {
                progress.modules[modIndex + 1].unlocked = true;
            }

            // Check if entire course is done
            const allDone = progress.modules.every((m) => m.completed);
            if (allDone) {
                progress.isCompleted = true;
                progress.completedAt = new Date();
                progress.overallProgress = 100;
                progress.certificateIssued = true;
                if (!progress.certificateIssuedAt) {
                    progress.certificateIssuedAt = new Date();
                }
            }

            await progress.save();
            if (allDone) {
                await ensureVerificationId(progress);
            }
            res.json({ success: true, progress, courseCompleted: allDone });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
);

// ─── GET generate & download certificate PDF ───────────────────────────────
// Generate and download certificate (only if course is completed)
router.get('/:courseId/certificate', auth, async (req, res) => {
    try {
        const userId = req.id; // From auth middleware
        const { courseId } = req.params;
        const { studentName = 'Student' } = req.query;

        if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid course ID' });
        }

        const progress = await UserProgress.findOne({ userId, courseId });
        if (!progress) {
            return res
                .status(404)
                .json({ success: false, message: 'Progress not found' });
        }

        if (!progress.isCompleted) {
            return res
                .status(403)
                .json({ success: false, message: 'Course not completed yet' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: 'Course not found' });
        }

        // Fallback: Frontend-only sharing used instead
        return res.status(501).json({ success: false, message: 'Server-side PDF generation is disabled. Please use the frontend download.' });

        if (!progress.certificateIssued) {
            progress.certificateIssued = true;
            progress.certificateIssuedAt = new Date();
            await progress.save();
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificate-${course.slug}.pdf"`,
        });
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
