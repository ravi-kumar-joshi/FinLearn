const User = require("../models/User");
const bcrypt = require("bcrypt");

const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  const id = req.id;

  try {
    // Basic validation
    if (!password || password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    const findedUser = await User.findById(id);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if OTP was verified
    if (!findedUser.password_otp.status) {
      const error = new Error("OTP not verified");
      error.statusCode = 400;
      throw error;
    }

    // Check if OTP expired already
    if (findedUser.password_otp.time < Date.now()) {
      const error = new Error("OTP expired");
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    findedUser.password = hashedPassword;

    // Clear OTP & status
    findedUser.password_otp.status = false;
    findedUser.password_otp.otp = null;   // IMPORTANT (delete OTP)
    findedUser.password_otp.time = null;  // Remove expiry too

    await findedUser.save();

    // Clear login tokens (force new login)
    // Attributes must match the original Set-Cookie for Android Chrome to actually clear them
    const isProd = process.env.NODE_ENV === "production";
    const clearOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      partitioned: isProd,
      path: "/",
    };
    res.clearCookie("accessToken", clearOpts);
    res.clearCookie("refreshToken", clearOpts);

    res.status(200).json({
      message: "Password updated successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updatePassword;
