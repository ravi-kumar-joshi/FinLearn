const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in minutes
        default: 15,
    },
    xpReward: {
        type: Number,
        default: 20,
    },
    content: {
        type: String,
        required: true, // HTML or markdown content
    },
    videoUrl: {
        type: String,
        default: null,
    },
    resources: [
        {
            title: String,
            url: String,
        },
    ],
    quiz: {
        questions: [
            {
                id: String,
                question: String,
                options: [String],
                correctAnswer: Number, // Index of correct option
                explanation: String,
            },
        ],
    },
});

const moduleSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    xpReward: {
        type: Number,
        default: 100,
    },
    lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        /** Stable external id — some deployments index this uniquely alongside _id */
        courseId: {
            type: String,
            sparse: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            enum: ["Savings", "Investing", "Budgeting", "Debt", "Retirement", "Tax"],
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },
        thumbnail: {
            type: String,
            default: null,
        },
        instructor: {
            type: String,
            default: "FinanceQuest Team",
        },
        duration: {
            type: Number, // in minutes
            default: 0,
        },
        rating: {
            type: Number,
            default: 5,
            min: 0,
            max: 5,
        },
        totalEnrollments: {
            type: Number,
            default: 0,
        },
        modules: [moduleSchema],
        prerequisites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);
