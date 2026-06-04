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
 */
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    console.log("Origin:", req.headers.origin);
    console.log("Cookie Header:", req.headers.cookie);
    console.log("Cookies Parsed:", req.cookies);

    // Primary: HTTP-only cookie — Secondary: Authorization Bearer header
    const accessToken =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!accessToken) {
      const error = new Error("Access token required");
      error.statusCode = 403;
      throw error;
    }

    // Use SYNCHRONOUS jwt.verify to avoid race condition where next()
    // runs before the callback populates req.id / req.email.
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);

    req.id = decoded.id;
    req.email = decoded.email;

    next();
  } catch (error) {
    // Normalise JWT-specific errors into a 403
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      error.statusCode = 403;
      error.message = "Unauthorized - Invalid or expired token";
    }
    next(error);
  }
};

module.exports = auth;
