/**
 * Google OAuth Strategy Setup
 *
 * Android-compatible OAuth flow:
 * The standard approach of setting cookies in the Google callback doesn't work
 * when the backend (Render) and frontend (Vercel) are on different domains —
 * cookies set on `finlearn-1.onrender.com` never reach the Vercel proxy domain.
 *
 * Solution: Instead of setting cookies in the callback, we generate a short-lived
 * "exchange code" (JWT, 60s expiry) and redirect the browser to the Vercel frontend
 * with that code. The client then calls `/user/set-token-cookies` through the Vercel
 * proxy, which sets the proper cookies on the Vercel domain.
 *
 * Flow:
 *   Client → /auth/google (Render) → Google OAuth → /auth/google/callback (Render)
 *   → 302 to ${ORIGIN}/auth/google/callback?code=<exchangeCode>
 *   → Client exchanges code via /api/user/set-token-cookies → cookies set on Vercel domain
 */
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
      // Generate a short-lived exchange code (JWT signed with ACCESS_TOKEN_KEY)
      // This code is passed to the frontend which exchanges it for proper cookies
      // via the Vercel proxy — solving the cross-domain cookie problem.
      const exchangeCode = jwt.sign(
        {
          id: req.userId,           // set by googleAuth middleware
          email: req.userEmail,     // set by googleAuth middleware
          type: "oauth_code",       // marks this as an exchange code, not an access token
        },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: "60s" }        // very short-lived — single use
      );

      // Redirect to the Vercel frontend with the exchange code
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
