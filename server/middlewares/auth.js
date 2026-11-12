/**
 * Auth Middleware
 *
 * Extracts the access token from the HttpOnly cookie, verifies it
 * synchronously (avoids the async-callback race condition where next()
 * could fire before req.id/req.email are set), and attaches the decoded
 * user fields to the request object for downstream controllers.
 *
 * Also falls back to the Authorization header for token transport
 * (useful when cookies are stripped by certain mobile proxies).
 *
 * Security fixes applied:
 *   #4  - Missing token now returns 401 (unauthenticated), not 403 (forbidden).
 *   #10 - req.isAdmin now set from JWT payload (embedded at login time),
 *         eliminating the extra DB round-trip in admin.js on every request.
 *   #11 - Bearer token extracted with a regex instead of a raw slice(7).
 *   #15 - Pinned algorithm ["HS256"] prevents algorithm confusion attacks.
 */
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;

    // Primary: HTTP-only cookie — Secondary: Authorization Bearer header
    const accessToken = req.cookies?.accessToken || bearerToken;

    if (!accessToken) {
      const error = new Error("Access token required");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, {
      algorithms: ["HS256"],
    });

    if (decoded.purpose === "password_reset") {
      const error = new Error("Password reset token cannot authenticate this request");
      error.statusCode = 403;
      throw error;
    }

    req.id = decoded.id;
    req.email = decoded.email;
    req.isAdmin = Boolean(decoded.isAdmin);

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      error.statusCode = 401;
      error.message = "Unauthorized - Invalid or expired token";
    }
    next(error);
  }
};

module.exports = auth;
