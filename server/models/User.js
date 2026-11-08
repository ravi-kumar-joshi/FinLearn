
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
        type: String,
        default: null
      },
      time: {
        type: Number, 
        default: null
      },
      attempts: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
      },
      verify_attempts: {
        type: Number,
        default: 0,
        min: 0
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


    email_otp: {
      otp: {
        type: Number,
        default: null
      },
      time: {
        type: Number, 
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
        default: 5, 
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
      longestStreak: {
        type: Number,
        default: 0,
        min: 0
      },
      lastActivityDate: {
        type: Date,
        default: null
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
        default: null
      },
      goals: [{
        type: String
      }],
      timeCommitment: {
        type: String,
        default: null
      },
      learningStyle: {
        type: String,
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
    timestamps: true, 
  
  }
);

module.exports = mongoose.model("User", userSchema);
