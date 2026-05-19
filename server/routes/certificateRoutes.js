/**
 * Public certificate verification routes
 * Mount: app.use('/certificates', certificateRoutes)
 */

const express = require('express');
const auth = require('../middlewares/auth');
const UserProgress = require('../models/UserProgress');
const {
    ensureVerificationId,
    findProgressByVerifyId,
    formatCertificatePayload,
} = require('../utils/certificateVerify');

const router = express.Router();

async function handleVerify(req, res) {
    const { verifyId } = req.params;

    try {
        const progress = await findProgressByVerifyId(verifyId);
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No certificate found for this verification ID.',
            });
        }

        const payload = formatCertificatePayload(progress, verifyId.trim().toUpperCase());
        res.json({ success: true, ...payload });
    } catch (err) {
        console.error('[certificates/verify]', err);
        res.status(500).json({ success: false, message: 'Server error during verification' });
    }
}

/** Public — lookup certificate by verification ID */
router.get('/verify/:verifyId', handleVerify);

/** Alias for OG / older clients */
router.get('/og-meta/:verifyId', handleVerify);

/** Authenticated — ensure verification ID exists for completed course */
router.get('/issue/:courseId', auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        if (!courseId?.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' });
        }

        const progress = await UserProgress.findOne({ userId, courseId })
            .populate('userId', 'name profileImage')
            .populate('courseId');

        if (!progress) {
            return res.status(404).json({ success: false, message: 'Progress not found' });
        }

        if (!progress.isCompleted) {
            return res.status(403).json({ success: false, message: 'Course not completed yet' });
        }

        await ensureVerificationId(progress);
        const refreshed = await UserProgress.findById(progress._id)
            .populate('userId', 'name profileImage')
            .populate('courseId');

        const payload = formatCertificatePayload(refreshed, refreshed.verificationId);
        res.json({ success: true, ...payload });
    } catch (err) {
        console.error('[certificates/issue]', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
