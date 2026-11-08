const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            const error = new Error("Refresh token required");
            error.statusCode = 401;
            throw error;
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
        } catch (err) {
            // Refresh token expired or invalid — user must re-login
            const error = new Error("Session expired — please log in again");
            error.statusCode = 401;
            throw error;
        }
        const user = await User.findById(decoded.id).select("_id email name");
        if (!user) {
            const error = new Error("User account no longer exists");
            error.statusCode = 401;
            throw error;
        }
        const { accessToken, refreshToken: newRefreshToken } = generateToken(user, "7d");

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
        res.cookie("refreshToken", newRefreshToken, cookieOptions(30));

        res.status(200).json({
            message: "Token refreshed",
            status: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = refreshToken;
