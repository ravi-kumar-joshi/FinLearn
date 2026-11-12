/**
 * server/__tests__/auth.routes.test.js
 *
 * Integration tests for all auth-related HTTP routes using Supertest.
 * No real DB or mail connection — all external modules are mocked.
 */

// ─── Mocks (must be hoisted — jest.mock calls are hoisted to top of file) ───

jest.mock('../models/User');
jest.mock('../utils/sendMail');
jest.mock('bcrypt');
jest.mock('../utils/generateToken');

// Also mock mongoose so app.js doesn't attempt a real DB connection
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      ...actual.connection,
      close: jest.fn().mockResolvedValue({}),
    },
  };
});

// ─── Imports ─────────────────────────────────────────────────────────────────

const request      = require('supertest');
const app          = require('../src/app');
const User         = require('../models/User');
const sendMail     = require('../utils/sendMail');
const bcrypt       = require('bcrypt');
const generateToken = require('../utils/generateToken');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a realistic mock Mongoose user document */
function makeMockUser(overrides = {}) {
  return {
    _id:      'user-id-123',
    name:     'Ravi Kumar',
    email:    'ravi@example.com',
    password: 'hashed-password',
    profileImage: null,
    isAdmin:  false,
    onboarding: { completed: false },
    password_otp: {
      otp:               null,
      time:              null,
      attempts:          5,
      last_attempt_time: null,
      status:            false,
    },
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// afterAll: close any open handles
// ─────────────────────────────────────────────────────────────────────────────

afterAll(async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection && mongoose.connection.close) {
    await mongoose.connection.close();
  }
});

// =============================================================================
// POST /user/login
// =============================================================================

describe('POST /user/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 200 happy path ──────────────────────────────────────────────────────────
  it('200 — returns token and user data, sets cookies on successful login', async () => {
    const mockUser = makeMockUser();
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue({
      accessToken:  'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });

    const res = await request(app)
      .post('/user/login')
      .send({ email: 'ravi@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Login successful',
      status:  true,
      token:   'mock-access-token',
      user: expect.objectContaining({
        email: 'ravi@example.com',
        name:  'Ravi Kumar',
      }),
    });
    // Cookies should be set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  // ── 400 missing email ───────────────────────────────────────────────────────
  it('400 — missing email', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ status: false });
    expect(res.body.message).toMatch(/required/i);
  });

  // ── 400 missing password ────────────────────────────────────────────────────
  it('400 — missing password', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ email: 'ravi@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ status: false });
    expect(res.body.message).toMatch(/required/i);
  });

  // ── 400 user not found ──────────────────────────────────────────────────────
  it('400 — user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/user/login')
      .send({ email: 'unknown@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no user found/i);
  });

  // ── 400 Google OAuth user (no password) ────────────────────────────────────
  it('400 — Google OAuth user attempting password login', async () => {
    const googleUser = makeMockUser({ password: undefined });
    User.findOne.mockResolvedValue(googleUser);

    const res = await request(app)
      .post('/user/login')
      .send({ email: 'ravi@example.com', password: 'anypassword' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/google sign-in/i);
  });

  // ── 400 incorrect password ──────────────────────────────────────────────────
  it('400 — incorrect password', async () => {
    User.findOne.mockResolvedValue(makeMockUser());
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/user/login')
      .send({ email: 'ravi@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/incorrect password/i);
  });

  // ── 500 DB error ────────────────────────────────────────────────────────────
  it('500 — DB throws unexpected error', async () => {
    User.findOne.mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app)
      .post('/user/login')
      .send({ email: 'ravi@example.com', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ status: false });
  });
});

// =============================================================================
// POST /user/register
// =============================================================================

describe('POST /user/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 201 happy path ──────────────────────────────────────────────────────────
  it('201 — registers new user, returns user data', async () => {
    User.findOne.mockResolvedValue(null); // no duplicate

    const savedUser = {
      _id:   'new-user-id',
      name:  'Ravi Kumar',
      email: 'ravi@example.com',
      save:  jest.fn().mockResolvedValue(true),
    };

    // Mock the User constructor
    User.mockImplementation(() => savedUser);
    bcrypt.hash.mockResolvedValue('hashed-password');

    const res = await request(app)
      .post('/user/register')
      .send({ name: 'Ravi Kumar', email: 'ravi@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      message: 'User registered successfully',
      status:  true,
      user: expect.objectContaining({
        name:  'Ravi Kumar',
        email: 'ravi@example.com',
      }),
    });
  });

  // ── 400 missing name ────────────────────────────────────────────────────────
  it('400 — missing name', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({ email: 'ravi@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  // ── 400 missing email ───────────────────────────────────────────────────────
  it('400 — missing email', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({ name: 'Ravi Kumar', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  // ── 400 invalid email format ────────────────────────────────────────────────
  it('400 — invalid email format', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({ name: 'Ravi Kumar', email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  // ── 400 password too short ──────────────────────────────────────────────────
  it('400 — password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({ name: 'Ravi Kumar', email: 'ravi@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  // ── 400 duplicate email ─────────────────────────────────────────────────────
  it('400 — duplicate email (user already exists)', async () => {
    User.findOne.mockResolvedValue(makeMockUser()); // existing user found

    const res = await request(app)
      .post('/user/register')
      .send({ name: 'Ravi Kumar', email: 'ravi@example.com', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // ── 500 DB save error ───────────────────────────────────────────────────────
  it('500 — DB throws error on save', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');

    const failingUser = {
      _id:   'new-user-id',
      name:  'Ravi Kumar',
      email: 'ravi@example.com',
      save:  jest.fn().mockRejectedValue(new Error('DB write failed')),
    };
    User.mockImplementation(() => failingUser);

    const res = await request(app)
      .post('/user/register')
      .send({ name: 'Ravi Kumar', email: 'ravi@example.com', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ status: false });
  });
});

// =============================================================================
// POST /user/refresh-token
// =============================================================================

describe('POST /user/refresh-token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 200 valid refresh token ─────────────────────────────────────────────────
  it('200 — issues new tokens when valid refresh token cookie is provided', async () => {
    const jwt = require('jsonwebtoken');

    // We need a real refresh token signed with the test key
    const realJwt = jest.requireActual('jsonwebtoken');
    const validToken = realJwt.sign(
      { id: 'user-id-123', email: 'ravi@example.com' },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: '30d' }
    );

    const mockUser = {
      _id:   'user-id-123',
      name:  'Ravi Kumar',
      email: 'ravi@example.com',
      select: jest.fn().mockReturnThis(),
    };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    generateToken.mockReturnValue({
      accessToken:  'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const res = await request(app)
      .post('/user/refresh-token')
      .set('Cookie', [`refreshToken=${validToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Token refreshed',
      status:  true,
    });
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });

  // ── 401 no refresh token cookie ────────────────────────────────────────────
  it('401 — no refresh token cookie present', async () => {
    const res = await request(app)
      .post('/user/refresh-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/refresh token required/i);
  });

  // ── 401 invalid/expired token ───────────────────────────────────────────────
  it('401 — invalid or expired refresh token', async () => {
    const res = await request(app)
      .post('/user/refresh-token')
      .set('Cookie', ['refreshToken=completely.invalid.token']);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/session expired|invalid/i);
  });

  // ── 401 user no longer exists ───────────────────────────────────────────────
  it('401 — user no longer exists in DB after token verification', async () => {
    const realJwt = jest.requireActual('jsonwebtoken');
    const validToken = realJwt.sign(
      { id: 'deleted-user-id', email: 'gone@example.com' },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: '30d' }
    );

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null), // user not found
    });

    const res = await request(app)
      .post('/user/refresh-token')
      .set('Cookie', [`refreshToken=${validToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no longer exists/i);
  });
});

// =============================================================================
// GET /user/logout
// =============================================================================

describe('GET /user/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('200 — clears cookies and returns success', async () => {
    const res = await request(app).get('/user/logout');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: 'success', status: true });
  });
});

// =============================================================================
// POST /user/password/forget
// =============================================================================

describe('POST /user/password/forget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 200 happy path ──────────────────────────────────────────────────────────
  it('200 — sends OTP and returns attemptsLeft', async () => {
    const mockUser = makeMockUser();
    User.findOne.mockResolvedValue(mockUser);
    sendMail.mockResolvedValue(true);

    const res = await request(app)
      .post('/user/password/forget')
      .send({ email: 'ravi@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: true,
    });
    expect(res.body).toHaveProperty('attemptsLeft');
    expect(res.body).toHaveProperty('expiresAt');
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  // ── 400 missing email ───────────────────────────────────────────────────────
  it('400 — missing email', async () => {
    const res = await request(app)
      .post('/user/password/forget')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  // ── 400 invalid email format ────────────────────────────────────────────────
  it('400 — invalid email format', async () => {
    const res = await request(app)
      .post('/user/password/forget')
      .send({ email: 'not-valid' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  // ── 400 user not found ──────────────────────────────────────────────────────
  it('400 — user not found with given email', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/user/password/forget')
      .send({ email: 'unknown@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no user found/i);
  });

  // ── 429 rate limit exceeded ─────────────────────────────────────────────────
  it('429 — rate limit exceeded (0 attempts within 24h)', async () => {
    const rateLimitedUser = makeMockUser({
      password_otp: {
        otp:               null,
        time:              null,
        attempts:          0, // exhausted
        last_attempt_time: new Date(), // within last 24h
        status:            false,
      },
    });
    User.findOne.mockResolvedValue(rateLimitedUser);

    const res = await request(app)
      .post('/user/password/forget')
      .send({ email: 'ravi@example.com' });

    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/daily limit/i);
  });

  // ── 500 sendMail throws error ───────────────────────────────────────────────
  it('500 — sendMail throws, propagates as server error', async () => {
    const mockUser = makeMockUser();
    User.findOne.mockResolvedValue(mockUser);
    sendMail.mockRejectedValue(new Error('SMTP connection refused'));

    const res = await request(app)
      .post('/user/password/forget')
      .send({ email: 'ravi@example.com' });

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ status: false });
  });
});
