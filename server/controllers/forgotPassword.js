/**
 * Forgot Password Controller (Performance & Reliability Optimized)
 *
 * Handles password reset flow by sending HMAC-hashed OTP to user's email.
 * Implements rate limiting (5 attempts per 24 hours), 30s debounce protection,
 * and enumeration prevention.
 *
 * @module controllers/forgotPassword
 */

const User = require("../models/User");
const { randomInt } = require("node:crypto");
const sendMail = require("../utils/sendMail");
const {
  OTP_TTL_MS,
  DAILY_WINDOW_MS,
  MAX_SEND_ATTEMPTS,
  hashOtp,
} = require("../utils/passwordResetOtp");

const GENERIC_MESSAGE = "OTP sent to your email";

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function snapshotOtp(passwordOtp) {
  return {
    otp: passwordOtp?.otp ?? null,
    time: passwordOtp?.time ?? null,
    attempts: passwordOtp?.attempts ?? MAX_SEND_ATTEMPTS,
    last_attempt_time: passwordOtp?.last_attempt_time ?? null,
    status: passwordOtp?.status ?? false,
    verify_attempts: passwordOtp?.verify_attempts ?? 0,
  };
}

async function claimOtpSlot(user) {
  const previous = snapshotOtp(user.password_otp);
  const now = Date.now();
  const lastAttempt = previous.last_attempt_time
    ? new Date(previous.last_attempt_time).getTime()
    : null;
  const withinDay = Number.isFinite(lastAttempt) && now - lastAttempt <= DAILY_WINDOW_MS;

  if (withinDay && previous.attempts <= 0) {
    const hoursLeft = Math.ceil((DAILY_WINDOW_MS - (now - lastAttempt)) / (60 * 60 * 1000));
    throw httpError(
      `Daily limit reached. Please try again in ${hoursLeft} hour(s)`,
      429
    );
  }

  // Debounce protection: prevent duplicate requests within 30 seconds
  if (withinDay && now - lastAttempt < 30 * 1000 && previous.otp) {
    const secondsLeft = Math.ceil((30 * 1000 - (now - lastAttempt)) / 1000);
    throw httpError(
      `An OTP was recently sent. Please wait ${secondsLeft}s before requesting a new one.`,
      429
    );
  }

  const otp = randomInt(100000, 1000000);
  const expiresAt = now + OTP_TTL_MS;
  const attemptsLeft = withinDay ? Math.max(0, previous.attempts - 1) : MAX_SEND_ATTEMPTS - 1;
  const nextState = {
    otp: hashOtp(user.email, otp),
    last_attempt_time: new Date(now),
    attempts: attemptsLeft,
    time: expiresAt,
    status: false,
    verify_attempts: 0,
  };

  const filter = { _id: user._id };
  if (user.password_otp && user.password_otp.attempts != null) {
    filter["password_otp.attempts"] = user.password_otp.attempts;
    filter["password_otp.last_attempt_time"] = user.password_otp.last_attempt_time ?? null;
  } else {
    filter.$or = [
      { password_otp: null },
      { password_otp: { $exists: false } },
      { "password_otp.attempts": null },
    ];
  }

  const updated = await User.findOneAndUpdate(
    filter,
    { $set: { password_otp: nextState } },
    { new: true }
  );

  if (!updated) return null;
  return { otp, expiresAt, previous, otpHash: nextState.otp, attemptsLeft };
}

const forgotPassword = async (req, res, next) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  try {
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      throw httpError("A valid email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({
        message: GENERIC_MESSAGE,
        status: true,
        expiresAt: Date.now() + OTP_TTL_MS,
      });
      return;
    }

    let claimed = null;
    for (let attempt = 0; attempt < 2 && !claimed; attempt += 1) {
      const current = attempt === 0 ? user : await User.findOne({ email });
      if (!current) break;
      claimed = await claimOtpSlot(current);
    }

    if (!claimed) {
      throw httpError("A reset is already in progress. Please try again.", 409);
    }

    try {
      await sendMail({
        otp: claimed.otp,
        receiver: user.email,
        subject: "Password Reset OTP",
      });
    } catch (mailError) {
      await User.updateOne(
        { _id: user._id, "password_otp.otp": claimed.otpHash },
        { $set: { password_otp: claimed.previous } }
      );
      throw mailError;
    }

    res.status(200).json({
      message: GENERIC_MESSAGE,
      status: true,
      attemptsLeft: claimed.attemptsLeft,
      expiresAt: claimed.expiresAt,
      ...(process.env.NODE_ENV === "development" &&
        process.env.EXPOSE_OTP === "true" && { otp: claimed.otp }),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = forgotPassword;
