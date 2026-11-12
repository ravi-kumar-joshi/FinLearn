/**
 * Error Handler Middleware
 *
 * Centralized Express error handler — must be the last middleware registered.
 *
 * Fix applied:
 *   #15 - In production, 5xx error messages are replaced with a generic string
 *         so internal DB errors, file paths, and stack frames are never sent
 *         to the client. 4xx messages (client errors) are still forwarded
 *         because they are intentional and user-facing.
 */

const errorHandler = (error, req, res, next) => {
  // Extract error details with fallbacks
  const statusCode = error.statusCode || 500;
  const isDevMode = process.env.NODE_ENV === "development";

  // Sanitise server-error messages in production.
  // Staging/production will not expose Mongoose error strings or internal details.
  const message =
    isDevMode || statusCode < 500
      ? error.message || "Internal server error"
      : "Internal server error";

  // Log error for debugging (dev only)
  if (isDevMode) {
    console.error("❌ Error:", {
      message: error.message,
      statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    message,
    status: false,
    // Include stack trace only in development
    ...(isDevMode && { stack: error.stack }),
  });
};

module.exports = errorHandler;
