/**
 * Gamification Utilities
 * Handles XP calculations, level progression, streak tracking, and achievements
 */

// XP System
export const XP_CONFIG = {
    LESSON_COMPLETION: 50,
    QUIZ_CORRECT_ANSWER: 100,
    QUIZ_INCORRECT_ANSWER: 50,
    PERFECT_QUIZ: 200,
    STREAK_MULTIPLIER: { 3: 1.25, 5: 1.5, 7: 2.0 },
    LEVEL_UP_THRESHOLD: 1000,
};

// Calculate total XP to reach a level
export const calculateXPForLevel = (level) => {
    return level * XP_CONFIG.LEVEL_UP_THRESHOLD;
};

// Calculate current level from XP
export const getLevelFromXP = (xp) => {
    return Math.floor(xp / XP_CONFIG.LEVEL_UP_THRESHOLD) + 1;
};

// Calculate XP progress to next level
export const getXPProgressToNextLevel = (xp) => {
    const currentXP = xp % XP_CONFIG.LEVEL_UP_THRESHOLD;
    const progress = (currentXP / XP_CONFIG.LEVEL_UP_THRESHOLD) * 100;
    return {
        current: currentXP,
        total: XP_CONFIG.LEVEL_UP_THRESHOLD,
        progress: Math.round(progress),
    };
};

// Calculate XP with streak multiplier
export const calculateXPWithMultiplier = (baseXP, streak) => {
    for (const [streakThreshold, multiplier] of Object.entries(
        XP_CONFIG.STREAK_MULTIPLIER
    )) {
        if (streak >= parseInt(streakThreshold)) {
            return Math.floor(baseXP * multiplier);
        }
    }
    return baseXP;
};

// Achievement Badges
export const ACHIEVEMENTS = {
    PERFECT_SCORE: {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Got all answers correct on a quiz',
        icon: 'trophy',
        rarity: 'epic',
    },
    EXPERT: {
        id: 'expert',
        name: 'Expert',
        description: 'Scored 80%+ on a quiz',
        icon: 'award',
        rarity: 'rare',
    },
    LEARNER: {
        id: 'learner',
        name: 'Learner',
        description: 'Scored 60%+ on a quiz',
        icon: 'target',
        rarity: 'common',
    },
    STREAK_7: {
        id: 'streak_7',
        name: 'On Fire!',
        description: 'Maintained a 7-day learning streak',
        icon: 'flame',
        rarity: 'rare',
    },
    STREAK_30: {
        id: 'streak_30',
        name: 'Legend',
        description: 'Maintained a 30-day learning streak',
        icon: 'crown',
        rarity: 'epic',
    },
    COURSE_MASTER: {
        id: 'course_master',
        name: 'Course Master',
        description: 'Completed 5 courses',
        icon: 'book',
        rarity: 'epic',
    },
    SPEED_RUNNER: {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Completed a course in 2 days',
        icon: 'zap',
        rarity: 'rare',
    },
};

// Check if user earned achievement
export const checkAchievement = (userStats) => {
    const achievements = [];

    if (userStats.lastQuizScore === 100) {
        achievements.push(ACHIEVEMENTS.PERFECT_SCORE);
    }
    if (userStats.lastQuizScore >= 80) {
        achievements.push(ACHIEVEMENTS.EXPERT);
    }
    if (userStats.streak >= 7) {
        achievements.push(ACHIEVEMENTS.STREAK_7);
    }
    if (userStats.streak >= 30) {
        achievements.push(ACHIEVEMENTS.STREAK_30);
    }
    if (userStats.coursesCompleted >= 5) {
        achievements.push(ACHIEVEMENTS.COURSE_MASTER);
    }

    return achievements;
};

// Streak Management
export const updateStreak = (lastActiveDate, currentDate) => {
    const lastDate = new Date(lastActiveDate);
    const today = new Date(currentDate);

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'continue'; // Streak continues
    } else if (diffDays === 0) {
        return 'same'; // Same day
    } else {
        return 'broken'; // Streak broken
    }
};

// Difficulty levels and XP scaling
export const DIFFICULTY_LEVELS = {
    BEGINNER: { multiplier: 1, label: 'Beginner', color: '#10b981' },
    INTERMEDIATE: { multiplier: 1.5, label: 'Intermediate', color: '#f59e0b' },
    ADVANCED: { multiplier: 2, label: 'Advanced', color: '#ef4444' },
};

// Calculate total course XP
export const calculateCourseXP = (modules) => {
    return modules.reduce((total, module) => total + (module.xp || 0), 0);
};

// Progress calculation
export const calculateProgress = (completed, total) => {
    return Math.round((completed / total) * 100);
};

// Time spent tracking
export const formatTimeSpent = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

// Format duration display
export const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};
