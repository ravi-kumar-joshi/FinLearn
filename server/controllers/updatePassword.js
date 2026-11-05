const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { PASSWORD_MIN, PASSWORD_MAX } = require("../utils/passwordResetOtp");

const updatePassword = async (req, res, next) => {
  try {
    const password = req.body?.password;
    const id = req.id;

    if (typeof password !== "string" || password.length < PASSWORD_MIN) {
      const error = new Error(`Password must be at least ${PASSWORD_MIN} characters`);
      error.statusCode = 400;
      throw error;
    }

    if (password.length > PASSWORD_MAX) {
      const error = new Error(`Password must be at most ${PASSWORD_MAX} characters`);
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid password reset session");
      error.statusCode = 403;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: id,
        "password_otp.status": true,
        "password_otp.time": { $gte: Date.now() },
      },
      {
        $set: {
          password: hashedPassword,
          "password_otp.status": false,
          "password_otp.otp": null,
          "password_otp.time": null,
          "password_otp.verify_attempts": 0,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      const error = new Error("Password reset verification is missing or expired");
      error.statusCode = 400;
      throw error;
    }

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
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid password reset session";
    }
    next(error);
  }
};

module.exports = updatePassword;
