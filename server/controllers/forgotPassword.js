/**
 * Forgot Password Controller
 * 
 * Handles password reset flow by sending OTP to user's email
 * Implements rate limiting (5 attempts per 24 hours)
 * OTP expires after 2 minutes
 * 
 * @module controllers/forgotPassword
 * @async
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @returns {Object} Success message with OTP (OTP only sent in development)
 * @throws {Error} 400 - User not found or rate limit exceeded
 */

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendMail = require("../utils/sendMail");

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Validate email
    if (!email) {
      const error = new Error("Email is required");
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

    /**
     * Rate Limiting Logic
     * Users can request OTP 5 times per 24 hours
     * Attempts reset after 24 hours from first attempt
     */
    const userOtp = findedUser.password_otp?.otp;

    if (userOtp) {
      const currentTime = new Date().getTime();
      const lastAttemptTime = new Date(findedUser.password_otp.last_attempt_time).getTime();
      const timeDifference = currentTime - lastAttemptTime;
      const withinDay = timeDifference <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Reset attempts after 24 hours
      if (!withinDay) {
        findedUser.password_otp.attempts = 5;
        await findedUser.save();
      }

      // Check if attempts exhausted within 24 hours
      if (findedUser.password_otp.attempts === 0 && withinDay) {
        const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - timeDifference) / (60 * 60 * 1000));
        const error = new Error(
          `Daily limit reached. Please try again in ${hoursLeft} hour(s)`
        );
        error.statusCode = 429; // Too Many Requests
        throw error;
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Update user's password_otp data
    findedUser.password_otp.otp = otp;
    findedUser.password_otp.last_attempt_time = new Date();
    findedUser.password_otp.attempts = (findedUser.password_otp.attempts || 5) - 1;
    findedUser.password_otp.time = new Date().getTime() + 2 * 60 * 1000; // 2 minutes expiry
    findedUser.password_otp.status = false; // Reset verification status

    await findedUser.save();

    // Send OTP via email
    await sendMail({
      otp,
      receiver: findedUser.email,
      subject: "Password Reset OTP"
    });

    // Generate temporary access token for OTP verification
    const user = {
      email: findedUser.email,
      _id: findedUser._id,
    };

    const { accessToken } = generateToken(user, "15m"); // Short-lived token

    // Set cookie with environment-aware settings (Android CHIPS compatible)
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      partitioned: isProd,       // CHIPS — Android Chrome cross-site cookie support
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Send success response
    res.status(200).json({
      message: `6-digit OTP sent to ${findedUser.email}`,
      status: true,
      attemptsLeft: findedUser.password_otp.attempts,
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    next(error);
  }
};

module.exports = forgotPassword;
