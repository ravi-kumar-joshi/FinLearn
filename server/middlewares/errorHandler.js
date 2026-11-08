const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500
    ? "Internal server error"
    : (error.message || "Internal server error");
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
  }

  res.status(statusCode).json({
    message,
    status: false,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: error.stack })
  });
};

module.exports = errorHandler;
