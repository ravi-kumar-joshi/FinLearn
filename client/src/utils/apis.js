
const apis = () => {
  // Determine whether we are running locally (development) or in production.
  // Vite exposes the current mode on `import.meta.env.MODE`.
  const isDevelopment = import.meta.env.MODE === 'development';

  // Base URL used to build the API endpoints. When developing locally,
  // requests point to the express server at port 5050. Change the
  // production URL to your deployed backend when ready.

  const base = 'https://finlearn-1.onrender.com/';

  // Each key represents a logical API endpoint. Keep paths relative to `base`.
  const list = {
    // ==================== Authentication ====================
    // POST: login credentials -> returns auth cookie / session
    loginUser: `${base}user/login`,
    // POST: user registration data
    registerUser: `${base}user/register`,
    // GET: check access / roles for current session
    getAccess: `${base}user/access`,
    // GET/POST: logout the current user and clear session
    logout: `${base}user/logout`,

    // ==================== Password Management ====================
    // POST: request password reset (sends OTP/email)
    forgetPassword: `${base}user/password/forget`,
    // POST: verify one-time password sent to user
    verifyOtp: `${base}user/otp/verify`,
    // GET: returns OTP expiry information for a session
    getOtpExpTime: `${base}user/otp/exp`,
    // POST: update password after verification
    updatePassword: `${base}user/password/update`,

    // ==================== User Profile ====================
    // GET: fetch current user's profile
    getUserProfile: `${base}user/profile`,
    // PUT/PATCH: update profile fields for current user
    updateProfile: `${base}user/profile`,
    // POST: upload profile image (multipart/form-data)
    uploadProfileImage: `${base}user/profile/image`,

    // ==================== Email Change ====================
    // POST: send OTP to new email address
    sendEmailOtp: `${base}user/profile/email/send-otp`,
    // POST: verify the OTP for changing email
    verifyEmailOtp: `${base}user/profile/email/verify-otp`,

    // ==================== Onboarding ====================
    // POST: save onboarding choices/metadata
    saveOnboarding: `${base}user/onboarding`,
    // POST: mark onboarding as skipped for the user
    skipOnboarding: `${base}user/onboarding/skip`,

    // ==================== Gamification & Leaderboard ====================
    // GET: fetch leaderboard data (XP, ranks, etc.)
    getLeaderboard: `${base}user/leaderboard`,

    // ==================== Courses ====================
    // GET: fetch list of all courses
    getAllCourses: `${base}courses`,
    // GET: fetch a single course by id (append `/id` when using)
    getCourseById: `${base}courses`,
    // POST/PUT endpoints for completing lessons/modules - add ids when calling
    completeLessonApi: `${base}courses`,
    completeModuleApi: `${base}courses`,
    // GET: obtain certificate for completed course (append path/query)
    getCertificate: `${base}courses`,
  };

  return list;
};

export default apis;
