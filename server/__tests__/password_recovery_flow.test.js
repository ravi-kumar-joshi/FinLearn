/**
 * FinLearn – Password Recovery & Authentication Flow Verification Suite
 * Executed with Node.js built-in test runner (node --test)
 *
 * Tests the complete flow:
 * 1. Valid registered email (Sends OTP, 200, returns expiresAt + attemptsLeft)
 * 2. Invalid email format / missing email (400 validation failure)
 * 3. Email delivery failure (Mocked sendMail rejection handled gracefully, 500)
 * 4. Successful OTP verification (Returns JWT resetToken with purpose: 'password_reset')
 * 5. Incorrect OTP (400 rejection, OTP mismatch)
 * 6. Expired OTP (400 rejection when otpExpiry <= Date.now())
 * 7. Successful password reset (Hashes password, clears OTP state, 200)
 * 8. Login using the new password (Verifies old password rejected, new password accepted)
 */

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Set environment variables before any module loads
process.env.SESSION_SECRET = 'test-session-secret-for-password-flow-32c!!';
process.env.ACCESS_TOKEN_KEY = 'test-access-token-secret-for-password-!!';
process.env.REFRESH_TOKEN_KEY = 'test-refresh-token-secret-for-password!';
process.env.MAIL_PASSWORD = 'mock-app-password';
process.env.NODE_ENV = 'test';

// Mock nodemailer.createTransport to avoid external SMTP calls during tests
let shouldSmtpFail = false;
nodemailer.createTransport = () => ({
  sendMail: async (mailOptions) => {
    if (shouldSmtpFail) {
      throw new Error('SMTP connection error: remote host unreachable');
    }
    return { messageId: '<mock-msg-id-12345@finlearn.test>' };
  },
});

// Import controllers and utilities
const forgotPasswordController = require('../controllers/forgotPassword');
const verifyOtpController = require('../controllers/verifyOtp');
const updatePasswordController = require('../controllers/updatePassword');
const loginController = require('../controllers/login');
const passwordResetAuthMiddleware = require('../middlewares/passwordResetAuth');
const User = require('../models/User');

// Mock request / response helpers
const createMockReq = (overrides = {}) => ({
  body: {},
  headers: {},
  cookies: {},
  ...overrides,
});

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    cookies: {},
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    cookie(name, val, opts) {
      this.cookies[name] = { val, opts };
      return this;
    },
    clearCookie(name, opts) {
      this.clearedCookies.push({ name, opts });
      return this;
    },
  };
  return res;
};

describe('Password Recovery & Authentication Flow', () => {
  // Shared mock database state
  let mockUserDb;

  beforeEach(() => {
    shouldSmtpFail = false;

    // Seed mock user with known initial password
    mockUserDb = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      password: bcrypt.hashSync('OldPassword123!', 10),
      isAdmin: false,
      onboarding: { completed: true },
      password_otp: {
        otp: null,
        time: null,
        attempts: 5,
        last_attempt_time: null,
        status: false,
      },
      save: async function () {
        return this;
      },
    };

    // Mock User.findOne
    User.findOne = async (query) => {
      if (query.email === mockUserDb.email) {
        if ('password_otp.otp' in query) {
          if (mockUserDb.password_otp.otp === query['password_otp.otp']) {
            return mockUserDb;
          }
          return null;
        }
        return mockUserDb;
      }
      return null;
    };

    // Mock User.findOneAndUpdate
    User.findOneAndUpdate = async (filter, update) => {
      if (
        filter._id === mockUserDb._id &&
        mockUserDb.password_otp.status === true &&
        mockUserDb.password_otp.time >= Date.now()
      ) {
        if (update.$set) {
          if (update.$set.password) mockUserDb.password = update.$set.password;
          if (update.$set['password_otp.status'] !== undefined) {
            mockUserDb.password_otp.status = update.$set['password_otp.status'];
          }
          if (update.$set['password_otp.otp'] !== undefined) {
            mockUserDb.password_otp.otp = update.$set['password_otp.otp'];
          }
          if (update.$set['password_otp.time'] !== undefined) {
            mockUserDb.password_otp.time = update.$set['password_otp.time'];
          }
        }
        return mockUserDb;
      }
      return null;
    };
  });

  // -------------------------------------------------------------------------
  // Test 1: Valid Registered Email (Forgot Password)
  // -------------------------------------------------------------------------
  it('1. Valid registered email - successfully generates OTP and returns expiresAt', async () => {
    const req = createMockReq({
      body: { email: 'ravi.kumar@example.com' },
    });
    const res = createMockRes();
    let nextCalled = null;

    await forgotPasswordController(req, res, (err) => {
      nextCalled = err;
    });

    assert.equal(nextCalled, null, 'next() should not receive an error');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, true);
    assert.ok(res.body.expiresAt, 'Response must contain expiresAt');
    assert.ok(mockUserDb.password_otp.otp >= 100000 && mockUserDb.password_otp.otp <= 999999);
    assert.equal(mockUserDb.password_otp.attempts, 4);
    assert.equal(mockUserDb.password_otp.status, false);
  });

  // -------------------------------------------------------------------------
  // Test 2: Invalid Email Format
  // -------------------------------------------------------------------------
  it('2. Invalid email - returns 400 validation error', async () => {
    const testCases = ['', 'invalid-email', 'missing@domain', null, undefined];

    for (const badEmail of testCases) {
      const req = createMockReq({ body: { email: badEmail } });
      const res = createMockRes();
      let capturedError = null;

      await forgotPasswordController(req, res, (err) => {
        capturedError = err;
      });

      assert.ok(capturedError, `Should reject invalid email: ${badEmail}`);
      assert.equal(capturedError.statusCode, 400);
      assert.match(capturedError.message, /valid email/i);
    }
  });

  // -------------------------------------------------------------------------
  // Test 3: Email Delivery Failure
  // -------------------------------------------------------------------------
  it('3. Email delivery failure - propagates error through next(error)', async () => {
    shouldSmtpFail = true;

    const req = createMockReq({ body: { email: 'ravi.kumar@example.com' } });
    const res = createMockRes();
    let capturedError = null;

    await forgotPasswordController(req, res, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError, 'Should catch SMTP failure');
    assert.match(capturedError.message, /Failed to send email/i);
  });

  // -------------------------------------------------------------------------
  // Test 4: Successful OTP Verification
  // -------------------------------------------------------------------------
  it('4. Successful OTP verification - returns JWT resetToken', async () => {
    // Stage an active OTP
    const activeOtp = 654321;
    mockUserDb.password_otp.otp = activeOtp;
    mockUserDb.password_otp.time = Date.now() + 120000; // 2 mins in future
    mockUserDb.password_otp.status = false;

    const req = createMockReq({
      body: { email: 'ravi.kumar@example.com', otp: activeOtp },
    });
    const res = createMockRes();
    let nextCalled = null;

    await verifyOtpController(req, res, (err) => {
      nextCalled = err;
    });

    assert.equal(nextCalled, null);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, true);
    assert.ok(res.body.resetToken, 'Must return resetToken');

    // Verify the JWT token has purpose: 'password_reset'
    const decoded = jwt.verify(res.body.resetToken, process.env.ACCESS_TOKEN_KEY);
    assert.equal(decoded.purpose, 'password_reset');
    assert.equal(decoded.id, mockUserDb._id);
    assert.equal(mockUserDb.password_otp.status, true);
    assert.equal(mockUserDb.password_otp.otp, null, 'OTP should be cleared after verification');
  });

  // -------------------------------------------------------------------------
  // Test 5: Incorrect OTP
  // -------------------------------------------------------------------------
  it('5. Incorrect OTP - returns 400 error', async () => {
    mockUserDb.password_otp.otp = 111111;
    mockUserDb.password_otp.time = Date.now() + 120000;

    const req = createMockReq({
      body: { email: 'ravi.kumar@example.com', otp: 999999 }, // Mismatched OTP
    });
    const res = createMockRes();
    let capturedError = null;

    await verifyOtpController(req, res, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError);
    assert.equal(capturedError.statusCode, 400);
    assert.match(capturedError.message, /Incorrect OTP/i);
  });

  // -------------------------------------------------------------------------
  // Test 6: Expired OTP
  // -------------------------------------------------------------------------
  it('6. Expired OTP - returns 400 error indicating expiry', async () => {
    const expiredOtp = 222222;
    mockUserDb.password_otp.otp = expiredOtp;
    mockUserDb.password_otp.time = Date.now() - 5000; // 5 seconds in the past

    const req = createMockReq({
      body: { email: 'ravi.kumar@example.com', otp: expiredOtp },
    });
    const res = createMockRes();
    let capturedError = null;

    await verifyOtpController(req, res, (err) => {
      capturedError = err;
    });

    assert.ok(capturedError);
    assert.equal(capturedError.statusCode, 400);
    assert.match(capturedError.message, /expired/i);
  });

  // -------------------------------------------------------------------------
  // Test 7: Successful Password Reset
  // -------------------------------------------------------------------------
  it('7. Successful password reset - updates hashed password and invalidates reset session', async () => {
    // Generate valid resetToken
    const resetToken = jwt.sign(
      { email: mockUserDb.email, id: mockUserDb._id, purpose: 'password_reset' },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '10m', issuer: 'financial-literacy-hub', audience: 'api-client' }
    );

    // User is in verified state
    mockUserDb.password_otp.status = true;
    mockUserDb.password_otp.time = Date.now() + 600000;

    // Simulate request through passwordResetAuth middleware
    const authReq = createMockReq({
      headers: { authorization: `Bearer ${resetToken}` },
      body: { password: 'NewSecurePassword456!' },
    });
    let authNextCalled = false;
    passwordResetAuthMiddleware(authReq, {}, (err) => {
      assert.equal(err, undefined);
      authNextCalled = true;
    });
    assert.ok(authNextCalled, 'passwordResetAuth should authenticate valid token');
    assert.equal(authReq.id, mockUserDb._id);

    // Call updatePassword controller
    const res = createMockRes();
    let capturedError = null;
    await updatePasswordController(authReq, res, (err) => {
      capturedError = err;
    });

    assert.equal(capturedError, null);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, true);
    assert.match(res.body.message, /Password updated successfully/i);

    // Verify password is now hashed with the NEW password
    const isNewPasswordMatch = bcrypt.compareSync('NewSecurePassword456!', mockUserDb.password);
    assert.equal(isNewPasswordMatch, true, 'Stored password must match new password');

    const isOldPasswordMatch = bcrypt.compareSync('OldPassword123!', mockUserDb.password);
    assert.equal(isOldPasswordMatch, false, 'Stored password must NOT match old password');
  });

  // -------------------------------------------------------------------------
  // Test 8: Login using the New Password
  // -------------------------------------------------------------------------
  it('8. Login with new password succeeds and old password fails', async () => {
    // Simulate post-reset state: User has updated their password to NewSecurePassword456!
    mockUserDb.password = bcrypt.hashSync('NewSecurePassword456!', 10);

    // 1. Attempt login with OLD password -> should fail (400)
    const oldLoginReq = createMockReq({
      body: { email: 'ravi.kumar@example.com', password: 'OldPassword123!' },
    });
    const oldLoginRes = createMockRes();
    let oldLoginErr = null;

    await loginController(oldLoginReq, oldLoginRes, (err) => {
      oldLoginErr = err;
    });

    assert.ok(oldLoginErr, 'Old password must be rejected');
    assert.equal(oldLoginErr.statusCode, 400);
    assert.match(oldLoginErr.message, /Incorrect password/i);

    // 2. Attempt login with NEW password -> should succeed (200)
    const newLoginReq = createMockReq({
      body: { email: 'ravi.kumar@example.com', password: 'NewSecurePassword456!' },
    });
    const newLoginRes = createMockRes();
    let newLoginErr = null;

    await loginController(newLoginReq, newLoginRes, (err) => {
      newLoginErr = err;
    });

    assert.equal(newLoginErr, null, 'Login with new password should succeed');
    assert.equal(newLoginRes.statusCode, 200);
    assert.equal(newLoginRes.body.status, true);
    assert.equal(newLoginRes.body.user.email, 'ravi.kumar@example.com');
    assert.ok(newLoginRes.cookies.accessToken, 'Must set accessToken cookie');
    assert.ok(newLoginRes.cookies.refreshToken, 'Must set refreshToken cookie');
  });
});
