

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Extract access token from HTTP-only cookie
    const accessToken = req.cookies.accessToken;

    // Verify token doesn't exist
    if (!accessToken) {
      const error = new Error("Access token required");
      error.statusCode = 403;
      throw error;
    }

    // Verify token with secret key
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (error, decoded) => {
      if (error) {
        // Token is invalid or expired
        const authError = new Error("Unauthorized - Invalid or expired token");
        authError.statusCode = 403;
        throw authError;
      } else {
        // Attach user ID to request for use in controllers
        req.id = decoded.id;
        req.email = decoded.email; // Also attach email for convenience
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
