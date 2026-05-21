const googleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
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
      // Smart redirect based on user status
      if (req.isNewUser || !req.onboardingCompleted) {
        // New user or onboarding not completed -> go to onboarding
        return res.redirect(`${process.env.ORIGIN}/auth/onboarding`);
      } else {
        // Existing user with completed onboarding -> go to dashboard
        return res.redirect(`${process.env.ORIGIN}/dashboard`);
      }
    }
  );
};

module.exports = strategy;
