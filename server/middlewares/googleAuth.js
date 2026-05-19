const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const googleAuth = async (req, res, next) => {
  const { name, email } = req?.user?._json;

  try {
    let findedUser = await User.findOne({ email });
    let savedUser;
    let isNewUser = false;

    if (!findedUser) {
      // New user - create account
      const newUser = new User({
        name: name,
        email: email,
      });
      savedUser = await newUser.save();
      isNewUser = true;
    }

    const user = {
      email: findedUser?.email || email,
      _id: findedUser?._id || savedUser?._id,
    };

    const { accessToken, refreshToken } = generateToken(user, '7d');

    // COOKIE FIX FOR LOCALHOST VS PRODUCTION
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    // Store user info for redirect logic
    req.isNewUser = isNewUser;
    req.onboardingCompleted = findedUser?.onboarding?.completed || false;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = googleAuth;
