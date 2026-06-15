const User = require("../models/User");

const getAccess = async (req, res, next) => {
  try {
    const userId = req.id;
    const findedUser = await User.findById(userId);
    
    res.status(200).json({
      message: "success",
      status: true,
      onboardingCompleted: findedUser?.onboarding?.completed || false,
      isAdmin: findedUser?.isAdmin || false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAccess;
