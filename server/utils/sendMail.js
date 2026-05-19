/**
 * Email Service - OTP Sender
 * 
 * Sends beautifully formatted OTP emails using Nodemailer and Gmail
 * Used for password reset and email verification flows
 * 
 * @module utils/sendMail
 * @async
 * @param {Object} data - Email configuration
 * @param {string} data.receiver - Recipient email address
 * @param {number} data.otp - 6-digit OTP code
 * @param {string} [data.subject] - Email subject line
 * @returns {Promise<Object>} Nodemailer success response
 * @throws {Error} If email sending fails
 * 
 * @example
 * await sendMail({
 *   receiver: "user@example.com",
 *   otp: 123456,
 *   subject: "Password Reset OTP"
 * });
 */

const nodemailer = require("nodemailer");

const sendMail = async (data) => {
  try {
    // Validate required parameters
    if (!data.receiver || !data.otp) {
      throw new Error("Receiver email and OTP are required");
    }

    // Validate environment variable
    if (!process.env.MAIL_PASSWORD) {
      throw new Error("MAIL_PASSWORD not configured in environment");
    }

    /**
     * Gmail SMTP Configuration
     * Uses Gmail App Password (not regular password)
     * To generate: Google Account > Security > 2-Step Verification > App Passwords
     */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "6396rahulj@gmail.com", // TODO: Move to environment variable
        pass: process.env.MAIL_PASSWORD, // Gmail App Password
      },
    });

    /**
     * Email Configuration
     * HTML template with inline CSS for cross-client compatibility
     */
    const mailOptions = {
      from: {
        name: "Financial Literacy Hub",
        address: "6396rahulj@gmail.com" // TODO: Move to environment variable
      },
      to: data.receiver,
      subject: data.subject || "Your OTP for Password Reset",
      html: `<div style="
  background:#f5f7fa;
  padding:40px 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
">
  <div style="
    max-width:500px;
    margin:auto;
    background:white;
    padding:30px;
    border-radius:12px;
    box-shadow:0 4px 12px rgba(0,0,0,0.08);
  ">

    <div style="text-align:center;">
      <img 
        src="https://cdn-icons-png.flaticon.com/128/11472/11472815.png"
        alt="OTP Icon"
        width="60"
        style="margin-bottom:10px;"
      />
      <h2 style="margin:0; color:#222;">Your OTP Code</h2>
      <p style="color:#555; font-size:15px;">
        ${data.subject && data.subject.includes("Email") ? "Use the OTP below to verify your new email address." : "Use the OTP below to complete your password reset."}
      </p>
    </div>

    <div style="
      margin:25px 0;
      text-align:center;
      padding:20px;
      border-radius:10px;
      background:#f0f4ff;
      border:1px solid #dce3ff;
    ">
      <span style="
        font-size:38px;
        letter-spacing:8px;
        font-weight:700;
        color:#2a4bd7;
        font-family:monospace;
      ">
        ${data.otp}
      </span>
    </div>
    <p style="font-size:14px; color:#444; line-height:1.6;">
      This OTP is valid for <strong>2 minutes</strong>.  
      Do not share it with anyone for security reasons.
    </p>

    <p style="font-size:13px; color:#777; text-align:center; margin-top:30px;">
      If you did not request this, you can safely ignore this email.
    </p>

    <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">

    <div style="text-align:center;">
      <p style="color:#aaa; font-size:12px;">
        © 2025 Financial Literacy Hub<br>
        Empowering your financial journey.
      </p>
    </div>

  </div>
</div>

      `,
    };

    // Send email
    const success = await transporter.sendMail(mailOptions);

    // Log success (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.log('✉️ Email sent successfully to:', data.receiver);
      console.log('🔑 OTP:', data.otp);
    }

    return success;
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendMail;
