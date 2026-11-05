/**
 * Supertest coverage for the password-reset route:
 * POST /user/password/forget, POST /user/otp/verify, POST /user/password/update.
 * MongoDB and outbound email are mocked. JWT signing uses the test secret.
 */

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock("../utils/sendMail", () => jest.fn());

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const { hashOtp } = require("../utils/passwordResetOtp");

const USER_ID = "507f1f77bcf86cd799439011";
const EMAIL = "ravi@example.com";

function userDoc(overrides = {}) {
  return {
    _id: USER_ID,
    email: EMAIL,
    password_otp: {
      otp: null,
      attempts: 5,
      verify_attempts: 0,
      last_attempt_time: null,
      status: false,
      time: null,
      ...overrides,
    },
  };
}

function resetToken(extra = {}) {
  return jwt.sign(
    { email: EMAIL, id: USER_ID, purpose: "password_reset", ...extra },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: "10m",
      algorithm: "HS256",
      issuer: "financial-literacy-hub",
      audience: "api-client",
    }
  );
}

describe("password reset routes", () => {
  beforeEach(() => {
    sendMail.mockResolvedValue({ accepted: [EMAIL] });
    User.updateOne.mockResolvedValue({ acknowledged: true });
  });

  describe("POST /user/password/forget", () => {
    it("returns 200 and emails a code without putting the OTP in the body", async () => {
      User.findOne.mockResolvedValue(userDoc());
      User.findOneAndUpdate.mockImplementation(async (_filter, update) => ({
        ...userDoc(),
        password_otp: update.$set.password_otp,
      }));

      const response = await request(app)
        .post("/user/password/forget")
        .send({ email: "  Ravi@Example.com " });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("OTP sent to your email");
      expect(response.body.expiresAt).toEqual(expect.any(Number));
      expect(response.body.otp).toBeUndefined();
      expect(response.body.message).not.toContain(EMAIL);
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
        receiver: EMAIL,
        subject: "Password Reset OTP",
      }));
      const mailedOtp = sendMail.mock.calls[0][0].otp;
      expect(mailedOtp).toBeGreaterThanOrEqual(100000);
      expect(mailedOtp).toBeLessThanOrEqual(999999);
      expect(User.findOneAndUpdate.mock.calls[0][1].$set.password_otp.otp).toBe(
        hashOtp(EMAIL, mailedOtp)
      );
    });

    it("returns the same 200 payload when the email is not registered", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/user/password/forget")
        .send({ email: "missing@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        status: true,
        message: "OTP sent to your email",
      }));
      expect(sendMail).not.toHaveBeenCalled();
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 when the email is missing or invalid", async () => {
      const missing = await request(app).post("/user/password/forget").send({});
      const invalid = await request(app)
        .post("/user/password/forget")
        .send({ email: "not-an-email" });

      expect(missing.status).toBe(400);
      expect(missing.body.status).toBe(false);
      expect(invalid.status).toBe(400);
      expect(invalid.body.message).toMatch(/valid email/i);
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("returns 429 when the daily send limit is exhausted", async () => {
      User.findOne.mockResolvedValue(userDoc({
        attempts: 0,
        last_attempt_time: new Date(),
      }));

      const response = await request(app)
        .post("/user/password/forget")
        .send({ email: EMAIL });

      expect(response.status).toBe(429);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toMatch(/daily limit/i);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it("returns 500 when the database lookup fails", async () => {
      User.findOne.mockRejectedValue(new Error("mongo down"));

      const response = await request(app)
        .post("/user/password/forget")
        .send({ email: EMAIL });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Internal server error",
        status: false,
      });
      expect(response.body.stack).toBeUndefined();
    });
  });

  describe("POST /user/otp/verify", () => {
    it("returns 200 and a password-reset token for a matching code", async () => {
      const otp = 123456;
      User.findOne.mockResolvedValue(userDoc({
        otp: hashOtp(EMAIL, otp),
        time: Date.now() + 60_000,
        status: false,
      }));
      User.findOneAndUpdate.mockResolvedValue(userDoc({ status: true, otp: null }));

      const response = await request(app)
        .post("/user/otp/verify")
        .send({ email: EMAIL, otp });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      const decoded = jwt.verify(response.body.resetToken, process.env.ACCESS_TOKEN_KEY, {
        algorithms: ["HS256"],
        issuer: "financial-literacy-hub",
        audience: "api-client",
      });
      expect(decoded.purpose).toBe("password_reset");
      expect(String(decoded.id)).toBe(USER_ID);
    });

    it("returns 400 for a malformed code or a wrong code", async () => {
      const malformed = await request(app)
        .post("/user/otp/verify")
        .send({ email: EMAIL, otp: 12 });

      User.findOne.mockResolvedValue(userDoc({
        otp: hashOtp(EMAIL, 123456),
        time: Date.now() + 60_000,
      }));
      const wrong = await request(app)
        .post("/user/otp/verify")
        .send({ email: EMAIL, otp: 654321 });

      expect(malformed.status).toBe(400);
      expect(malformed.body.message).toMatch(/6 digits/i);
      expect(wrong.status).toBe(400);
      expect(wrong.body.message).toMatch(/incorrect otp/i);
      expect(User.updateOne).toHaveBeenCalled();
    });

    it("returns 400 when the code is expired", async () => {
      User.findOne.mockResolvedValue(userDoc({
        otp: hashOtp(EMAIL, 123456),
        time: Date.now() - 1000,
      }));

      const response = await request(app)
        .post("/user/otp/verify")
        .send({ email: EMAIL, otp: 123456 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/expired/i);
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 500 when the database update fails", async () => {
      User.findOne.mockResolvedValue(userDoc({
        otp: hashOtp(EMAIL, 123456),
        time: Date.now() + 60_000,
      }));
      User.findOneAndUpdate.mockRejectedValue(new Error("write failed"));

      const response = await request(app)
        .post("/user/otp/verify")
        .send({ email: EMAIL, otp: 123456 });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
      expect(response.body.status).toBe(false);
    });
  });

  describe("POST /user/password/update", () => {
    it("returns 200 and stores a hash when the reset token is valid", async () => {
      User.findOneAndUpdate.mockResolvedValue({ _id: USER_ID });

      const response = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${resetToken()}`)
        .send({ password: "new-secret" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Password updated successfully",
        status: true,
      });
      const written = User.findOneAndUpdate.mock.calls[0][1].$set.password;
      expect(written).not.toBe("new-secret");
      expect(written.startsWith("$2")).toBe(true);
    });

    it("returns 400 when the password is missing, short, or too long", async () => {
      const token = resetToken();
      const missing = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${token}`)
        .send({});
      const short = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ password: "123" });
      const huge = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ password: "a".repeat(129) });

      expect(missing.status).toBe(400);
      expect(short.status).toBe(400);
      expect(huge.status).toBe(400);
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("returns 403 when the reset token is missing, expired, or is a normal access token", async () => {
      const missing = await request(app)
        .post("/user/password/update")
        .send({ password: "new-secret" });

      const accessToken = jwt.sign(
        { email: EMAIL, id: USER_ID },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: "10m", algorithm: "HS256" }
      );
      const normalSession = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ password: "new-secret" });

      const expired = jwt.sign(
        {
          email: EMAIL,
          id: USER_ID,
          purpose: "password_reset",
          exp: Math.floor(Date.now() / 1000) - 10,
        },
        process.env.ACCESS_TOKEN_KEY,
        {
          algorithm: "HS256",
          issuer: "financial-literacy-hub",
          audience: "api-client",
        }
      );
      const expiredResponse = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${expired}`)
        .send({ password: "new-secret" });

      expect(missing.status).toBe(403);
      expect(normalSession.status).toBe(403);
      expect(expiredResponse.status).toBe(403);
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("rejects a password-reset token on a normal authenticated route", async () => {
      const response = await request(app)
        .get("/user/profile")
        .set("Authorization", `Bearer ${resetToken()}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/password reset token/i);
    });

    it("returns 500 when the password update query fails", async () => {
      User.findOneAndUpdate.mockRejectedValue(new Error("mongo down"));

      const response = await request(app)
        .post("/user/password/update")
        .set("Authorization", `Bearer ${resetToken()}`)
        .send({ password: "new-secret" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
      expect(response.body.status).toBe(false);
    });
  });
});
