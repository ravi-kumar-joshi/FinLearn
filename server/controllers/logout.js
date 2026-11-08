const logout = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
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
