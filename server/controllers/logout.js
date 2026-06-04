/**
 * Logout Controller
 *
 * Clears authentication cookies with matching attributes
 * (path, sameSite, secure, partitioned) — required for Android Chrome
 * which will NOT clear a cookie unless all attributes match the original Set-Cookie.
 */
const logout = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // clearCookie options MUST match the original Set-Cookie attributes
    // (except maxAge which is set to 0 to expire immediately)
    const clearOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      partitioned: isProd,
      path: "/",
    };

    res.clearCookie("accessToken", clearOpts);
    res.clearCookie("refreshToken", clearOpts);

    res.status(200).json({ message: "success", status: true });
  } catch (error) {
    next(error);
  }
};

module.exports = logout;
