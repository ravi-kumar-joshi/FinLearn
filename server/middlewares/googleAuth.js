const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const googleAuth = async (req, res, next) => {
  const { name, email } = req?.user?._json;

  try {
    let findedUser = await User.findOne({ email });
    let savedUser;
    let isNewUser = false;

    if (!findedUser) {
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
    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = (maxDays) => ({
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      partitioned: isProd,
      maxAge: maxDays * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie("accessToken", accessToken, cookieOptions(7));
    res.cookie("refreshToken", refreshToken, cookieOptions(30));

    req.userId = user._id;
    req.userEmail = user.email;
    req.isNewUser = isNewUser;
    req.onboardingCompleted = findedUser?.onboarding?.completed || false;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = googleAuth;
