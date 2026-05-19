const User = require("../models/User");
const sendMail = require("../utils/sendMail");

const sendEmailOtp = async (req, res, next) => {
  const userId = req.id;
  const { newEmail } = req.body;

  try {
    if (!newEmail) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if new email is same as current email
    if (findedUser.email === newEmail) {
      const error = new Error("New email must be different from current email");
      error.statusCode = 400;
      throw error;
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    // Handle OTP attempt logic
    const userOtp = findedUser.email_otp?.otp;

    if (userOtp) {
      const withinDay =
        new Date().getTime() -
          new Date(findedUser.email_otp.last_attempt_time).getTime() <=
        24 * 60 * 60 * 1000;

      // Reset attempts next day
      if (!withinDay) {
        findedUser.email_otp.attempts = 5;
        await findedUser.save();
      }

      // If attempts are finished for today
      if (findedUser.email_otp.attempts === 0 && withinDay) {
        const error = new Error("you have reached your daily limit");
        error.statusCode = 400;
        throw error;
      }
    }

    // Generate a new OTP
    const otp = Math.floor(Math.random() * 900000) + 100000;

    // Initialize email_otp if it doesn't exist
    if (!findedUser.email_otp) {
      findedUser.email_otp = {
        otp: null,
        time: null,
        newEmail: null,
        attempts: 5,
        last_attempt_time: null,
        status: false,
      };
    }

    findedUser.email_otp.otp = otp;
    findedUser.email_otp.newEmail = newEmail;
    findedUser.email_otp.last_attempt_time = new Date();
    findedUser.email_otp.attempts--;
    findedUser.email_otp.time = new Date().getTime() + 2 * 60 * 1000; // OTP valid for 2 min
    findedUser.email_otp.status = false;
    await findedUser.save();

    // Send OTP email to new email address
    await sendMail({
      otp,
      receiver: newEmail,
      subject: "Verify Your New Email Address",
    });

    res.status(200).json({
      message: `6-digit OTP sent to ${newEmail}`,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = sendEmailOtp;

