/**
 * JWT Token Generator
 *
 * Creates a signed access token + refresh token pair for the given user.
 *
 * Fix applied:
 *   #10 - isAdmin is now embedded in the JWT payload so the admin middleware
 *         can authorise requests without an extra DB round-trip.
 *   #14 - Signature changed from (user, exp) to (user, options) with named
 *         fields { accessExp, refreshExp }. The old positional `exp` only
 *         controlled the access token while silently ignoring the refresh token
 *         expiry — the new API makes both explicit and self-documenting.
 *         Back-compat: if a plain string is passed as the second arg, it is
 *         treated as accessExp (no breaking change for existing callers).
 */

const jwt = require("jsonwebtoken");

/**
 * @param {Object} user - Mongoose User document
 * @param {Object|string} [options={}] - Named expiry options OR a plain string
 *   treated as accessExp for backward-compatibility.
 * @param {string} [options.accessExp="7d"]  - Access token lifespan
 * @param {string} [options.refreshExp="30d"] - Refresh token lifespan
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateToken = (user, options = {}) => {
  // Validate environment variables
  if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
    throw new Error("JWT secret keys not configured in environment variables");
  }

  // Back-compat — if a plain string was passed, treat it as access-token expiry.
  const opts = typeof options === "string" ? { accessExp: options } : options;
  const accessExp = opts.accessExp || "7d";
  const refreshExp = opts.refreshExp || "30d";

  // Include isAdmin in the payload
  const payload = {
    email: user.email,
    id: user._id,
    isAdmin: Boolean(user.isAdmin),
  };

  /**
   * Access Token
   * Short-lived token for API authentication.
   */
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: accessExp,
    issuer: "financial-literacy-hub",
    audience: "api-client",
  });

  /**
   * Refresh Token
   * Long-lived token for obtaining new access tokens.
   */
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: refreshExp,
    issuer: "financial-literacy-hub",
    audience: "api-client",
  });

  return { accessToken, refreshToken };
};

module.exports = generateToken;
