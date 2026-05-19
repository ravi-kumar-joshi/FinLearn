const User = require("../models/User");

const skipOnboarding = async (req, res, next) => {
  const userId = req.id;

  try {
    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Mark onboarding as completed with default/empty values
    findedUser.onboarding = {
      completed: true,
      experience: "",
      goals: [],
      timeCommitment: "",
      learningStyle: "",
      currentSituation: "",
      priority: "",
      completedAt: new Date(),
    };

    await findedUser.save();

    res.status(200).json({
      message: "Onboarding skipped",
      status: true,
      onboarding: findedUser.onboarding,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = skipOnboarding;

