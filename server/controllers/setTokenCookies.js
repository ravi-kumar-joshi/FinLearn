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

        let decoded;
        try {
            decoded = jwt.verify(code, process.env.ACCESS_TOKEN_KEY, {
                maxAge: "120s",
            });
        } catch (err) {
            const error = new Error("Exchange code expired or invalid — please try Google sign-in again");
            error.statusCode = 401;
            throw error;
        }

        if (decoded.type !== "oauth_code") {
            const error = new Error("Invalid exchange code type");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(decoded.id).select("_id email name onboarding");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const { accessToken, refreshToken } = generateToken(user, "7d");

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
