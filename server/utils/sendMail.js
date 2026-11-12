/**
 * Email Service - OTP Sender (Performance & Reliability Optimized)
 *
 * Sends beautifully formatted OTP emails using Nodemailer and Gmail SMTP.
 *
 * PERFORMANCE OPTIMIZATIONS:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Singleton Connection Pool (`pool: true`):
 *    Reuses open SMTP connections, reducing email delivery latency.
 * 2. Explicit Socket & Handshake Timeouts:
 *    connectionTimeout (8s), greetingTimeout (5s), and socketTimeout (10s)
 *    so slow connections fail fast with actionable errors rather than locking the UI.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @module utils/sendMail
 */

const nodemailer = require("nodemailer");

// Cached singleton transporter
let cachedTransporter = null;
let lastPasswordHash = null;

/**
 * Returns a pooled singleton Nodemailer transporter.
 * Recreates the transporter only if MAIL_PASSWORD or MAIL_USER changes.
 */
const getTransporter = () => {
  const mailPassword = process.env.MAIL_PASSWORD;
  const mailUser = process.env.MAIL_USER || "6396rahulj@gmail.com";

  if (!mailPassword) {
    throw new Error("MAIL_PASSWORD not configured in environment");
  }

  // Reuse existing transporter if credentials haven't changed
  if (cachedTransporter && lastPasswordHash === mailPassword) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    pool: true,               // Connection pooling: reuses open SMTP sockets
    maxConnections: 3,        // Concurrency limit suited for shared/dev hosting
    maxMessages: 100,         // Max messages per socket before clean recycle
    rateDelta: 1000,          // Rate-limiting window
    rateLimit: 5,             // Max 5 messages/sec to prevent Gmail throttle
    connectionTimeout: 8000,  // 8s timeout to establish socket
    greetingTimeout: 5000,    // 5s timeout for 220 greeting
    socketTimeout: 10000,     // 10s timeout for data transfer
    auth: {
      user: mailUser,
      pass: mailPassword,
    },
  });

  lastPasswordHash = mailPassword;
  return cachedTransporter;
};

const sendMail = async (data) => {
  try {
    // Validate required parameters
    if (!data.receiver || !data.otp) {
      throw new Error("Receiver email and OTP are required");
    }

    const mailUser = process.env.MAIL_USER || "6396rahulj@gmail.com";
    const transporter = getTransporter();

    /**
     * Email Configuration
     * Lightweight HTML template with inline styles for rapid rendering across all email clients
     */
    const mailOptions = {
      from: {
        name: "Financial Literacy Hub",
        address: mailUser,
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

    <div style="background:#fff8e6; border:1px solid #ffd591; padding:10px 14px; border-radius:8px; margin:15px 0; font-size:12px; color:#ad4e00; line-height:1.5;">
      ⏱️ <strong>Timestamp:</strong> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}<br/>
      💡 <em>If you receive more than one OTP email, always use the code from the most recent message.</em>
    </div>

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
</div>`,
    };

    // Send email via pooled connection
    const success = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === "development") {
      console.log("✉️ Email sent successfully to:", data.receiver);
    }

    return success;
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendMail;
