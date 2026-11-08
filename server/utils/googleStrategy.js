
const googleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const googleAuth = require("../middlewares/googleAuth");

const strategy = (app) => {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK || "https://finlearn-1.onrender.com/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
      prompt: "select_account",
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: process.env.FAILURE_URL || "/auth/login",
    }),
    googleAuth,
    (req, res) => {
      const exchangeCode = jwt.sign(
        {
          id: req.userId,      
          email: req.userEmail,     
          type: "oauth_code",
        },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: "60s" }       
      );

      const origin = process.env.ORIGIN || "https://fin-learn-client-ttsd.vercel.app";
      const isNewUser = req.isNewUser ? "&new=1" : "";
      const onboardingDone = req.onboardingCompleted ? "&onboarded=1" : "";

      return res.redirect(
        `${origin}/auth/google/callback?code=${exchangeCode}${isNewUser}${onboardingDone}`
      );
    }
  );
};

module.exports = strategy;
