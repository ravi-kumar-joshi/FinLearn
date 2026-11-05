const jwt = require("jsonwebtoken");

const passwordResetAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      const error = new Error("Password reset token required");
      error.statusCode = 403;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY, {
      algorithms: ["HS256"],
      issuer: "financial-literacy-hub",
      audience: "api-client",
    });

    if (decoded.purpose !== "password_reset" || !decoded.id) {
      const error = new Error("Invalid password reset token");
      error.statusCode = 403;
      throw error;
    }

    req.id = decoded.id;
    req.email = decoded.email;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      error.statusCode = 403;
      error.message = "Unauthorized - Invalid or expired password reset token";
    }
    next(error);
  }
};

module.exports = passwordResetAuth;
