

const jwt = require("jsonwebtoken");

const generateToken = (user, exp) => {
  // Validate environment variables
  if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
    throw new Error("JWT secret keys not configured in environment variables");
  }

  // Payload to encode in JWT
  const payload = {
    email: user.email,
    id: user._id
  };

  /**
   * Access Token
   * Short-lived token for API authentication
   * Expires based on 'exp' parameter (typically 7 days)
   */
  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: exp || "7d",
      issuer: "financial-literacy-hub",
      audience: "api-client"
    }
  );

  /**
   * Refresh Token
   * Long-lived token for obtaining new access tokens
   * Always expires in 30 days
   */
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn: "30d",
      issuer: "financial-literacy-hub",
      audience: "api-client"
    }
  );

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = generateToken;
