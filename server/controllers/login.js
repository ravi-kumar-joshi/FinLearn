/**
 * Login Controller
 * 
 * Authenticates user with email and password
 * Returns JWT tokens in HTTP-only cookies upon successful login
 * 
 * @module controllers/login
 * @async
 * @param {Object} req.body - Request body containing email and password
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @returns {Object} Success response with user data
 * @throws {Error} 400 - User not found or incorrect password
 */

const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate request body
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    // Find user by email
    const findedUser = await User.findOne({ email: email.toLowerCase() });
    if (!findedUser) {
      const error = new Error("No user found with this email");
      error.statusCode = 400;
      throw error;
    }

    // Check if user has a password (OAuth users don't have passwords)
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

    // Set cookies with appropriate security settings
    // Android Chrome requires Partitioned (CHIPS) flag for cross-site cookies
    const isProd = process.env.NODE_ENV === "production";
    console.log("NODE_ENV =", process.env.NODE_ENV);

    const cookieOptions = (maxDays) => ({
      httpOnly: true,          // Prevents XSS attacks
      secure: isProd,          // HTTPS only in production
      sameSite: isProd ? 'none' : 'lax', // Required for cross-domain on Android
      partitioned: isProd,     // CHIPS - prevents Android Chrome cookie blocking
      maxAge: maxDays * 24 * 60 * 60 * 1000,
      path: '/',               // Explicit path for consistent clearCookie behavior
    });

    res.cookie("accessToken", accessToken, cookieOptions(7));
    res.cookie("refreshToken", refreshToken, cookieOptions(30));

    // Return success response (don't send password to client)
    res.status(200).json({
      message: "Login successful",
      status: true,
      user: {
        id: findedUser._id,
        name: findedUser.name,
        email: findedUser.email,
        profileImage: findedUser.profileImage,
        onboardingCompleted: findedUser.onboarding?.completed || false
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = login;
