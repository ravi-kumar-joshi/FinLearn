const mongoose = require('mongoose');
const UserProgress = require('../models/UserProgress');

/** FL-{course6}-{user6} e.g. FL-A1B2C3-D4E5F6 */
function buildVerificationId(userId, courseId) {
    const u = userId.toString().slice(-6).toUpperCase();
    const c = courseId.toString().slice(-6).toUpperCase();
    return `FL-${c}-${u}`;
}

function parseVerifyId(verifyId) {
    if (!verifyId || typeof verifyId !== 'string') return null;
    const normalized = verifyId.trim().toUpperCase();
    const parts = normalized.split('-').filter(Boolean);
    if (parts[0] !== 'FL') return null;
    if (parts.length >= 3) {
        return { normalized, courseSuffix: parts[1], userSuffix: parts[2], legacy: false };
    }
    if (parts.length === 2) {
        return { normalized, courseSuffix: parts[1], userSuffix: null, legacy: true };
    }
    return null;
}

async function ensureVerificationId(progressDoc) {
    if (!progressDoc?.isCompleted) return null;
    const userId = progressDoc.userId?._id || progressDoc.userId;
    const courseId = progressDoc.courseId?._id || progressDoc.courseId;
    if (!userId || !courseId) return null;

    if (progressDoc.verificationId) return progressDoc.verificationId;

    const verificationId = buildVerificationId(userId, courseId);
    progressDoc.verificationId = verificationId;
    progressDoc.certificateIssued = true;
    if (!progressDoc.certificateIssuedAt) {
        progressDoc.certificateIssuedAt = new Date();
    }
    await progressDoc.save();
    return verificationId;
}

async function findProgressByVerifyId(verifyId) {
    const parsed = parseVerifyId(verifyId);
    if (!parsed) return null;

    let progress = await UserProgress.findOne({
        verificationId: parsed.normalized,
        isCompleted: true,
    })
        .populate('userId', 'name profileImage')
        .populate('courseId');

    if (progress) return progress;

    const courseQuery = {
        isCompleted: true,
        courseId: { $regex: new RegExp(parsed.courseSuffix + '$', 'i') },
    };

    if (parsed.userSuffix) {
        courseQuery.userId = { $regex: new RegExp(parsed.userSuffix + '$', 'i') };
    }

    progress = await UserProgress.findOne(courseQuery)
        .populate('userId', 'name profileImage')
        .populate('courseId');

    if (progress) {
        await ensureVerificationId(progress);
        return UserProgress.findById(progress._id)
            .populate('userId', 'name profileImage')
            .populate('courseId');
    }

    return null;
}

function formatCertificatePayload(progress, verifyId) {
    const user = progress.userId;
    const course = progress.courseId;
    const studentName = user?.name || 'Learner';
    const courseName = course?.title || 'Course';
    const verificationId = progress.verificationId || verifyId;
    const siteUrl = process.env.SITE_URL || 'https://finlearn.app';

    const lessonsTotal = (course?.modules || []).reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0
    );

    return {
        certificate: {
            studentName,
            courseName,
            totalXP: progress.totalXPEarned ?? 0,
            completedAt: progress.completedAt,
            certificateIssuedAt: progress.certificateIssuedAt,
            instructor: course?.instructor || 'FinLearn Team',
            verificationId,
            issuer: 'FinLearn Academy',
        },
        user: {
            name: studentName,
            profileImage: user?.profileImage || null,
        },
        course: {
            id: course?._id?.toString(),
            title: course?.title,
            description: course?.description || '',
            category: course?.category,
            difficulty: course?.difficulty,
            duration: course?.duration,
            rating: course?.rating,
            instructor: course?.instructor,
            lessonsTotal,
            modulesCount: course?.modules?.length ?? 0,
        },
        meta: {
            title: `${studentName} — Certificate of Completion`,
            description: `Verified completion of "${courseName}" on FinLearn Academy · ${progress.totalXPEarned ?? 0} XP earned.`,
            verifyUrl: `${siteUrl}/verify/${verificationId}`,
        },
    };
}

module.exports = {
    buildVerificationId,
    parseVerifyId,
    ensureVerificationId,
    findProgressByVerifyId,
    formatCertificatePayload,
};
