/**
 * Set Token Cookies Controller
 *
 * Receives a short-lived, signed "exchange code" (JWT) from the Google OAuth
 * callback and sets the proper accessToken + refreshToken cookies on the
 * domain the user is currently visiting (Vercel proxy domain).
 *
 * Why this is needed:
 * The Google OAuth redirect chain goes:
 *   Client (Vercel) → Render /auth/google → Google → Render /auth/google/callback
 * At the callback, `res.cookie` sets cookies on `finlearn-1.onrender.com`.
 * But the SPA runs on `fin-learn-client-ttsd.vercel.app`, so those cookies are
 * never sent with subsequent /api/* requests through the Vercel proxy.
 *
 * Flow:
 * 1. googleStrategy.js callback generates a 60-second exchange code (JWT)
 * 2. Redirects to `${ORIGIN}/auth/google/callback?code=<exchangeCode>`
 * 3. Client-side handler calls this endpoint (through Vercel proxy)
 * 4. This endpoint validates the code, looks up the user, sets proper cookies
 * 5. Client redirects to /dashboard or /onboarding
 */
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const setTokenCookies = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code) {
            const error = new Error("Exchange code is required");
            error.statusCode = 400;
            throw error;
        }

        // Verify the exchange code (short-lived JWT from Google callback)
        let decoded;
        try {
            decoded = jwt.verify(code, process.env.ACCESS_TOKEN_KEY, {
                maxAge: "120s", // code expires 2 min after issuance (allow clock skew)
            });
        } catch (err) {
            const error = new Error("Exchange code expired or invalid — please try Google sign-in again");
            error.statusCode = 401;
            throw error;
        }

        // Must be a valid oauth_code type
        if (decoded.type !== "oauth_code") {
            const error = new Error("Invalid exchange code type");
            error.statusCode = 400;
            throw error;
        }

        // Look up the user
        const user = await User.findById(decoded.id).select("_id email name onboarding");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Generate proper access + refresh tokens
        const { accessToken, refreshToken } = generateToken(user, "7d");

        // Set cookies on the domain the client is calling from (via Vercel proxy)
        const isProd = process.env.NODE_ENV === "production";
        const cookieOptions = (maxDays) => ({
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            partitioned: isProd,
            maxAge: maxDays * 24 * 60 * 60 * 1000,
            path: "/",
        });

        res.cookie("accessToken", accessToken, cookieOptions(7));
        res.cookie("refreshToken", refreshToken, cookieOptions(30));

        res.status(200).json({
            message: "Google sign-in successful",
            status: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                onboardingCompleted: user.onboarding?.completed || false,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = setTokenCookies;
