/**
 * Verify OTP Controller
 *
 * Checks the hashed password-reset OTP and atomically consumes it.
 * A second request with the same code cannot issue another reset token.
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  RESET_WINDOW_MS,
  MAX_VERIFY_ATTEMPTS,
  hashOtp,
  safeEqual,
} = require("../utils/passwordResetOtp");

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const verifyOtp = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = Number(body.otp);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw httpError("Email is required", 400);
    }

    if (!Number.isInteger(otp) || otp < 100000 || otp > 999999) {
      throw httpError("Invalid OTP format. Must be 6 digits", 400);
    }

    if (!process.env.ACCESS_TOKEN_KEY) {
      throw new Error("JWT secret keys not configured in environment variables");
    }

    const user = await User.findOne({ email });
    const stored = user?.password_otp;
    const storedHash = stored?.otp;

    if (!user || storedHash == null || storedHash === "") {
      throw httpError("Incorrect OTP", 400);
    }

    const verifyAttempts = stored.verify_attempts ?? 0;
    if (verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
      throw httpError("Too many incorrect attempts. Request a new code", 429);
    }

    const otpExpiry = stored.time;
    if (!Number.isFinite(otpExpiry) || otpExpiry <= Date.now()) {
      throw httpError("OTP has expired. Please request a new one", 400);
    }

    if (!safeEqual(storedHash, hashOtp(email, otp))) {
      const nextAttempts = verifyAttempts + 1;
      const update = nextAttempts >= MAX_VERIFY_ATTEMPTS
        ? {
            $set: {
              "password_otp.otp": null,
              "password_otp.status": false,
              "password_otp.verify_attempts": nextAttempts,
            },
          }
        : { $inc: { "password_otp.verify_attempts": 1 } };

      await User.updateOne(
        { _id: user._id, "password_otp.otp": storedHash },
        update
      );
      throw httpError("Incorrect OTP", 400);
    }

    const consumed = await User.findOneAndUpdate(
      {
        _id: user._id,
        "password_otp.otp": storedHash,
        "password_otp.status": false,
        "password_otp.time": { $gt: Date.now() },
      },
      {
        $set: {
          "password_otp.status": true,
          "password_otp.otp": null,
          "password_otp.time": Date.now() + RESET_WINDOW_MS,
          "password_otp.verify_attempts": 0,
        },
      },
      { new: true }
    );

    if (!consumed) {
      throw httpError("Incorrect OTP", 400);
    }

    const resetToken = jwt.sign(
      {
        email: consumed.email,
        id: consumed._id,
        purpose: "password_reset",
      },
      process.env.ACCESS_TOKEN_KEY,
      {
        expiresIn: "10m",
        algorithm: "HS256",
        issuer: "financial-literacy-hub",
        audience: "api-client",
      }
    );

    res.status(200).json({
      message: "OTP verified successfully",
      status: true,
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = verifyOtp;
