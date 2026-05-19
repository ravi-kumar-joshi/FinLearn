/**
 * Verify OTP Controller
 * 
 * Verifies the OTP sent to user's email for password reset
 * OTP must be valid and not expired (2 minute window)
 * 
 * @module controllers/verifyOtp
 * @async
 * @param {Object} req.body - Request body
 * @param {number} req.body.otp - 6-digit OTP code
 * @returns {Object} Success message if OTP is valid
 * @throws {Error} 400 - Incorrect or expired OTP
 */

const User = require("../models/User");

const verifyOtp = async (req, res, next) => {
  const otp = Number(req.body.otp);

  try {
    // Validate OTP format
    if (!otp || otp < 100000 || otp > 999999) {
      const error = new Error("Invalid OTP format. Must be 6 digits");
      error.statusCode = 400;
      throw error;
    }

    // Find user with matching OTP
    const findedUser = await User.findOne({
      "password_otp.otp": otp,
    });

    if (!findedUser) {
      const error = new Error("Incorrect OTP");
      error.statusCode = 400;
      throw error;
    }

    // Check if OTP has expired (2 minute window)
    const currentTime = Date.now();
    const otpExpiry = findedUser.password_otp.time;

    if (otpExpiry < currentTime) {
      const error = new Error("OTP has expired. Please request a new one");
      error.statusCode = 400;
      throw error;
    }

    // Double-check OTP matches (redundant but safe)
    if (findedUser.password_otp.otp !== otp) {
      const error = new Error("Incorrect OTP");
      error.statusCode = 400;
      throw error;
    }

    // Mark OTP as verified
    findedUser.password_otp.status = true;

    // Clear OTP to prevent reuse
    findedUser.password_otp.otp = null;

    await findedUser.save();

    res.status(200).json({
      message: "OTP verified successfully",
      status: true,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = verifyOtp;
