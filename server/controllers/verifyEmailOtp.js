const User = require("../models/User");

const verifyEmailOtp = async (req, res, next) => {
  const userId = req.id;
  const otp = Number(req.body.otp);

  try {
    if (!otp) {
      const error = new Error("OTP is required");
      error.statusCode = 400;
      throw error;
    }

    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if OTP exists
    if (!findedUser.email_otp?.otp) {
      const error = new Error("No OTP found. Please request a new OTP");
      error.statusCode = 400;
      throw error;
    }

    // Check expiry
    if (findedUser.email_otp.time < Date.now()) {
      const error = new Error("OTP expired. Please request a new OTP");
      error.statusCode = 400;
      throw error;
    }

    // Verify OTP
    if (findedUser.email_otp.otp !== otp) {
      const error = new Error("Incorrect OTP");
      error.statusCode = 400;
      throw error;
    }

    // Check if new email still doesn't exist (double check)
    const emailExists = await User.findOne({ email: findedUser.email_otp.newEmail });
    if (emailExists) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    // Update email
    findedUser.email = findedUser.email_otp.newEmail;

    // Clear email OTP data
    findedUser.email_otp.otp = null;
    findedUser.email_otp.newEmail = null;
    findedUser.email_otp.time = null;
    findedUser.email_otp.status = true;

    await findedUser.save();

    res.status(200).json({
      message: "Email updated successfully",
      status: true,
      user: {
        name: findedUser.name,
        email: findedUser.email,
        profileImage: findedUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = verifyEmailOtp;

