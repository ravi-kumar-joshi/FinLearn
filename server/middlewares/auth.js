const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
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

    next();
  } catch (error) {
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
