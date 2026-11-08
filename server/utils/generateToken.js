const jwt = require("jsonwebtoken");

const generateToken = (user, exp) => {
  if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
    throw new Error("JWT secret keys not configured in environment variables");
  }
  const payload = {
    email: user.email,
    id: user._id
  };
  const accessToken = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: exp || "7d",
      issuer: "financial-literacy-hub",
      audience: "api-client"
    }
  );

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
