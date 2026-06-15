const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length >= 2; // At least 2 options
            },
            message: 'Quiz must have at least 2 options'
        }
    },
    correctAnswer: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                return v >= 0 && v < this.options.length;
            },
            message: 'Correct answer must be a valid option index'
        }
    },
    explanation: {
        type: String,
        default: "",
    },
    xpReward: {
        type: Number,
        default: 10,
        min: 0,
    },
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Quiz title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            enum: ["Savings", "Investing", "Budgeting", "Debt", "Retirement", "Tax", "General"],
            default: "General",
        },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },
        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: function(v) {
                    return v && v.length >= 1; // At least 1 question
                },
                message: 'Quiz must have at least 1 question'
            }
        },
        timeLimit: {
            type: Number, // in minutes
            default: null, // null means no time limit
        },
        passingScore: {
            type: Number, // percentage (0-100)
            default: 70,
            min: 0,
            max: 100,
        },
        xpReward: {
            type: Number,
            default: 50,
            min: 0,
        },
        attempts: {
            type: Number,
            default: 0, // How many times this quiz has been taken
        },
        avgScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
