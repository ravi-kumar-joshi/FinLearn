const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }
    const findedUser = await User.findOne({ email: email.toLowerCase() });
    if (!findedUser) {
      const error = new Error("No user found with this email");
      error.statusCode = 400;
      throw error;
    }
    if (!findedUser.password) {
      const error = new Error("This account was registered using Google Sign-In. Please use the 'Continue with Google' option to log in.");
      error.statusCode = 400;
      error.isGoogleAccount = true;
      throw error;
    }

    // Verify password
    const isMatchPassword = await bcrypt.compare(password, findedUser.password);
    if (!isMatchPassword) {
      const error = new Error("Incorrect password");
      error.statusCode = 400;
      throw error;
    }

    // Generate JWT tokens (7 days expiry for access token)
    const { accessToken, refreshToken } = generateToken(findedUser, "7d");
    const isProd = process.env.NODE_ENV === "production";
    console.log("NODE_ENV =", process.env.NODE_ENV);

    const cookieOptions = (maxDays) => ({
      httpOnly: true,         
      secure: isProd,          
      sameSite: isProd ? 'none' : 'lax', 
      partitioned: isProd,     
      maxAge: maxDays * 24 * 60 * 60 * 1000,
      path: '/',               
    });

    res.cookie("accessToken", accessToken, cookieOptions(7));
    res.cookie("refreshToken", refreshToken, cookieOptions(30));

  
    res.status(200).json({
      message: "Login successful",
      status: true,
      token: accessToken,
      user: {
        id: findedUser._id,
        name: findedUser.name,
        email: findedUser.email,
        profileImage: findedUser.profileImage,
        onboardingCompleted: findedUser.onboarding?.completed || false,
        isAdmin: Boolean(findedUser.isAdmin),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = login;
