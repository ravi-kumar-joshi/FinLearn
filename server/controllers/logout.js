const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({message:'success',status:true})
  } catch (error) {
    next(error);
  }
};

module.exports = logout