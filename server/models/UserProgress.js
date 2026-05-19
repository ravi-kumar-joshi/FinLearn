const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema({
    lessonId: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    xpEarned: {
        type: Number,
        default: 0,
    },
    score: {
        type: Number,
        default: null, // Quiz score if applicable
    },
    attempts: {
        type: Number,
        default: 0,
    },
});

const moduleProgressSchema = new mongoose.Schema({
    moduleId: {
        type: String,
        required: true,
    },
    unlocked: {
        type: Boolean,
        default: false,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    xpEarned: {
        type: Number,
        default: 0,
    },
    quizScore: {
        type: Number,
        default: null,
    },
    quizPassed: {
        type: Boolean,
        default: false,
    },
    lessons: [lessonProgressSchema],
});

const userProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        enrolledAt: {
            type: Date,
            default: () => new Date(),
        },
        lastAccessedAt: {
            type: Date,
            default: () => new Date(),
        },
        overallProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalXPEarned: {
            type: Number,
            default: 0,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        certificateIssued: {
            type: Boolean,
            default: false,
        },
        certificateIssuedAt: {
            type: Date,
            default: null,
        },
        verificationId: {
            type: String,
            default: null,
            trim: true,
            uppercase: true,
            sparse: true,
        },
        modules: [moduleProgressSchema],
    },
    {
        timestamps: true,
    }
);

// Compound index for unique enrollment per user per course
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userProgressSchema.index({ verificationId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("UserProgress", userProgressSchema);
