
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      // Not required - Google OAuth users won't have passwords
      minlength: [6, 'Password must be at least 6 characters']
    },
    profileImage: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null,
      trim: true
    },
    location: {
      type: String,
      default: null,
      trim: true
    },
    bio: {
      type: String,
      default: null,
      trim: true
    },
    occupation: {
      type: String,
      default: null,
      trim: true
    },
    website: {
      type: String,
      default: null,
      trim: true
    },
    twitter: {
      type: String,
      default: null,
      trim: true
    },
    linkedin: {
      type: String,
      default: null,
      trim: true
    },
    github: {
      type: String,
      default: null,
      trim: true
    },


    password_otp: {
      otp: {
        type: Number,
        default: null
      },
      time: {
        type: Number, // Expiry timestamp
        default: null
      },
      attempts: {
        type: Number,
        default: 5, // Changed from 4 to 5 for better UX
        min: 0,
        max: 5
      },
      last_attempt_time: {
        type: Date,
        default: null
      },
      status: {
        type: Boolean,
        default: false // true when OTP is verified
      },
    },


    email_otp: {
      otp: {
        type: Number,
        default: null
      },
      time: {
        type: Number, // Expiry timestamp
        default: null
      },
      newEmail: {
        type: String,
        default: null,
        lowercase: true,
        trim: true
      },
      attempts: {
        type: Number,
        default: 5, // Changed from 4 to 5
        min: 0,
        max: 5
      },
      last_attempt_time: {
        type: Date,
        default: null
      },
      status: {
        type: Boolean,
        default: false
      },
    },


    xp: {
      totalXP: {
        type: Number,
        default: 0,
        min: 0
      },
      currentXP: {
        type: Number,
        default: 0,
        min: 0
      },
      level: {
        type: Number,
        default: 1,
        min: 1
      },
      maxXPForLevel: {
        type: Number,
        default: 7500
      }
    },

    leaderboardStats: {
      completedCourses: {
        type: Number,
        default: 0,
        min: 0
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      achievementCount: {
        type: Number,
        default: 0,
        min: 0
      },
      streak: {
        type: Number,
        default: 0,
        min: 0
      },
      rank: {
        type: Number,
        default: 0
      }
    },

    onboarding: {
      completed: {
        type: Boolean,
        default: false
      },
      experience: {
        type: String,
        // Recommended values: 'beginner', 'intermediate', 'advanced'
        // Enum removed to allow flexibility
        default: null
      },
      goals: [{
        type: String
      }],
      timeCommitment: {
        type: String,
        // Recommended values: '1-2 hours/week', '3-5 hours/week', '6+ hours/week'
        // Enum removed to allow flexibility
        default: null
      },
      learningStyle: {
        type: String,
        // Recommended values: 'visual', 'reading', 'interactive', 'video'
        // Enum removed to allow flexibility
        default: null
      },
      currentSituation: {
        type: String,
        default: null
      },
      priority: {
        type: String,
        default: null
      },
      completedAt: {
        type: Date,
        default: null
      },
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    // Note: 'timeseries' was likely a typo, changed to 'timestamps'
  }
);

module.exports = mongoose.model("User", userSchema);
