const User = require("../models/User");
const UserProgress = require("../models/UserProgress");

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

    const storedXP = findedUser.xp?.totalXP || 0;
    const displayTotalXP = Math.max(storedXP, totalLearningXP);

    const ls = findedUser.leaderboardStats || {};

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
          streak: ls.streak ?? 0,
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
