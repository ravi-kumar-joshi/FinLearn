const User = require("../models/User");

const getOtpExpTime = async (req, res, next) => {
  const id = req.id;

  try {
    const findedUser = await User.findById(id);
    res.status(200).json({
      message: "success",
      status: true,
      time: findedUser?.password_otp?.time - new Date().getTime(),
      email:findedUser.email
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getOtpExpTime;
