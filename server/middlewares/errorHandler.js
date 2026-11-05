

const errorHandler = (error, req, res, next) => {
  // Extract error details with fallbacks
  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500
    ? "Internal server error"
    : (error.message || "Internal server error");

  // Log error for debugging (in production, use proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
  }

  // Send error response to client
  res.status(statusCode).json({
    message,
    status: false,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: error.stack })
  });
};

module.exports = errorHandler;
