const User = require("../models/User");
const UserProgress = require("../models/UserProgress");

/**
 * Compute current streak and longest streak from lesson completion dates.
 * Streak = consecutive days (ending today or yesterday) with at least 1 lesson completed.
 */
function computeStreaks(progressRows) {
  // Collect all lesson completedAt dates
  const daySet = new Set();
  for (const pr of progressRows) {
    for (const m of pr.modules || []) {
      for (const l of m.lessons || []) {
        if (l.completed && l.completedAt) {
          const d = new Date(l.completedAt);
          // Normalize to YYYY-MM-DD in local time
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          daySet.add(key);
        }
      }
    }
  }

  if (daySet.size === 0) return { currentStreak: 0, longestStreak: 0 };

  // Sort unique day strings (lexicographic == chronological for YYYY-MM-DD)
  const sortedDays = [...daySet].sort();

  // Helper: get YYYY-MM-DD for a date offset from a base
  const dayKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Helper: add days to a date
  const addDays = (dateStr, n) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + n);
    return dayKey(dt);
  };

  // Compute current streak (starting from today or yesterday going backwards)
  const today = dayKey(new Date());
  let currentStreak = 0;
  let checkDay = daySet.has(today) ? today : addDays(today, -1);

  while (daySet.has(checkDay)) {
    currentStreak++;
    checkDay = addDays(checkDay, -1);
  }

  // Compute longest streak by scanning sorted days
  let longestStreak = 1;
  let runLength = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1];
    const curr = sortedDays[i];
    if (addDays(prev, 1) === curr) {
      runLength++;
      if (runLength > longestStreak) longestStreak = runLength;
    } else {
      runLength = 1;
    }
  }

  return { currentStreak, longestStreak };
}

const getUserProfile = async (req, res, next) => {
  const userId = req.id;
  try {
    const findedUser = await User.findById(userId).select(
      "name email profileImage onboarding xp leaderboardStats"
    );

    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const progressRows = await UserProgress.find({ userId });
    const enrolledCourses = progressRows.length;
    const completedCourses = progressRows.filter((p) => p.isCompleted).length;

    let totalLearningXP = 0;
    let totalLessonsCompleted = 0;
    let lessonsCompletedThisWeek = 0;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const pr of progressRows) {
      totalLearningXP += pr.totalXPEarned || 0;
      for (const m of pr.modules || []) {
        for (const l of m.lessons || []) {
          if (l.completed) {
            totalLessonsCompleted += 1;
            if (l.completedAt && new Date(l.completedAt) >= weekAgo) {
              lessonsCompletedThisWeek += 1;
            }
          }
        }
      }
    }

    const completionRate =
      enrolledCourses > 0
        ? Math.round((completedCourses / enrolledCourses) * 100)
        : 0;

    const weeklyGoal = 3;
    const weeklyProgressPct = Math.min(
      100,
      Math.round((lessonsCompletedThisWeek / weeklyGoal) * 100)
    );

    // Compute streak from lesson completion dates
    const { currentStreak, longestStreak } = computeStreaks(progressRows);

    // Persist streak data back to user if changed
    const ls = findedUser.leaderboardStats || {};
    const prevStreak = ls.streak ?? 0;
    const prevLongest = ls.longestStreak ?? 0;

    if (currentStreak !== prevStreak || longestStreak !== prevLongest) {
      await User.findByIdAndUpdate(userId, {
        "leaderboardStats.streak": currentStreak,
        "leaderboardStats.longestStreak": Math.max(longestStreak, prevLongest),
        "leaderboardStats.lastActivityDate": new Date(),
      });
    }

    const storedXP = findedUser.xp?.totalXP || 0;
    const displayTotalXP = Math.max(storedXP, totalLearningXP);

    res.status(200).json({
      message: "success",
      status: true,
      user: {
        name: findedUser.name,
        email: findedUser.email,
        profileImage: findedUser.profileImage,
        onboardingCompleted: findedUser.onboarding?.completed || false,
        xp: {
          totalXP: displayTotalXP,
          learningXP: totalLearningXP,
          currentXP: findedUser.xp?.currentXP ?? 0,
          level: findedUser.xp?.level ?? 1,
          maxXPForLevel: findedUser.xp?.maxXPForLevel ?? 7500,
        },
        leaderboardStats: {
          coursesEnrolled: enrolledCourses,
          completedCourses,
          completionRate,
          achievementCount: completedCourses,
          streak: currentStreak,
          longestStreak: Math.max(longestStreak, prevLongest),
          rank: ls.rank ?? 0,
        },
        dashboard: {
          totalLessonsCompleted,
          lessonsCompletedThisWeek,
          weeklyGoal,
          weeklyProgressPct,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getUserProfile;
