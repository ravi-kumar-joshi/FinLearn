
const express = require("express");

// Import controllers
const login = require("../controllers/login");
const register = require("../controllers/register");
const getUserProfile = require("../controllers/getUserProfile");
const getAccess = require("../controllers/getAccess");
const logout = require("../controllers/logout");
const forgotPassword = require("../controllers/forgotPassword");
const getOtpExpTime = require("../controllers/getOtpExpTime");
const verifyOtp = require("../controllers/verifyOtp");
const updatePassword = require("../controllers/updatePassword");
const saveOnboarding = require("../controllers/saveOnboarding");
const skipOnboarding = require("../controllers/skipOnboarding");
const updateProfile = require("../controllers/updateProfile");
const uploadProfileImage = require("../controllers/uploadProfileImage");
const sendEmailOtp = require("../controllers/sendEmailOtp");
const verifyEmailOtp = require("../controllers/verifyEmailOtp");
const getLeaderboard = require("../controllers/getLeaderboard");

// Import middleware
const auth = require("../middlewares/auth");

const router = express.Router();

// ==================== Public Routes ====================
// These routes don't require authentication


router.post("/login", login);


router.post("/register", register);


router.post("/password/forget", forgotPassword);


router.post("/otp/verify", verifyOtp);


router.get("/logout", logout);
// ==================== Protected Routes ====================
// These routes require JWT authentication (auth middleware)


router.get("/access", auth, getAccess);


router.get("/profile", auth, getUserProfile);


router.put("/profile", auth, updateProfile);


router.post("/profile/image", auth, uploadProfileImage);

// ==================== Password Management ====================


router.get("/otp/exp", auth, getOtpExpTime);


router.post("/password/update", auth, updatePassword);

// ==================== Email Change Flow ====================

router.post("/profile/email/send-otp", auth, sendEmailOtp);

router.post("/profile/email/verify-otp", auth, verifyEmailOtp);

// ==================== Onboarding ====================
router.post("/onboarding", auth, saveOnboarding);

router.post("/onboarding/skip", auth, skipOnboarding);

// ==================== Gamification & Leaderboard ====================

router.get("/leaderboard", auth, getLeaderboard);

// Export router
module.exports = router;
