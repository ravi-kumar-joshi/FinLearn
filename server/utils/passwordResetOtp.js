const crypto = require("node:crypto");

const OTP_TTL_MS = 2 * 60 * 1000;
const RESET_WINDOW_MS = 10 * 60 * 1000;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_SEND_ATTEMPTS = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;

function hashOtp(email, otp) {
  const key = process.env.ACCESS_TOKEN_KEY;
  if (!key) {
    throw new Error("JWT secret keys not configured in environment variables");
  }
  return crypto
    .createHmac("sha256", key)
    .update(`${String(email).toLowerCase()}:${otp}`)
    .digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  OTP_TTL_MS,
  RESET_WINDOW_MS,
  DAILY_WINDOW_MS,
  MAX_SEND_ATTEMPTS,
  MAX_VERIFY_ATTEMPTS,
  PASSWORD_MIN,
  PASSWORD_MAX,
  hashOtp,
  safeEqual,
};
