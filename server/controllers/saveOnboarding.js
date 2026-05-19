const User = require("../models/User");

const saveOnboarding = async (req, res, next) => {
  const userId = req.id;
  const { experience, goals, timeCommitment, learningStyle, currentSituation, priority } = req.body;

  try {
    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Save onboarding data
    findedUser.onboarding = {
      completed: true,
      experience,
      goals: Array.isArray(goals) ? goals : [],
      timeCommitment,
      learningStyle,
      currentSituation,
      priority,
      completedAt: new Date(),
    };

    await findedUser.save();

    res.status(200).json({
      message: "Onboarding completed successfully",
      status: true,
      onboarding: findedUser.onboarding,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = saveOnboarding;

