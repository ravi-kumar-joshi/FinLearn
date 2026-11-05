/**
 * server/__tests__/auth.middleware.test.js
 *
 * Unit tests for auth.js and optionalAuth.js middleware.
 * These tests run the middleware functions directly — no HTTP layer.
 */

// ─── Mock jsonwebtoken BEFORE importing the middleware ─────────────────────
let mockVerifyImpl = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: (...args) => mockVerifyImpl(...args),
}));

const auth         = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

// ── Helpers ────────────────────────────────────────────────────────────────
function makeReq(overrides = {}) {
  return {
    cookies: {},
    headers: {},
    ...overrides,
  };
}

function makeRes() {
  return {};
}

// ═══════════════════════════════════════════════════════════════════════════
// auth middleware
// ═══════════════════════════════════════════════════════════════════════════
describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Valid token in cookie ─────────────────────────────────────────────
  it('sets req.id and req.email from a valid cookie token, then calls next()', () => {
    mockVerifyImpl.mockReturnValue({ id: 'user-123', email: 'test@example.com' });

    const req  = makeReq({ cookies: { accessToken: 'valid.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(mockVerifyImpl).toHaveBeenCalledWith(
      'valid.jwt.token',
      process.env.ACCESS_TOKEN_KEY,
      { algorithms: ['HS256'] }
    );
    expect(req.id).toBe('user-123');
    expect(req.email).toBe('test@example.com');
    expect(next).toHaveBeenCalledWith(/* no args */);
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 2. Valid token in Authorization header ───────────────────────────────
  it('falls back to Authorization: Bearer header when no cookie', () => {
    mockVerifyImpl.mockReturnValue({ id: 'user-456', email: 'bearer@example.com' });

    const req  = makeReq({ headers: { authorization: 'Bearer header.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(mockVerifyImpl).toHaveBeenCalledWith(
      'header.jwt.token',
      process.env.ACCESS_TOKEN_KEY,
      { algorithms: ['HS256'] }
    );
    expect(req.id).toBe('user-456');
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 3. No token at all ───────────────────────────────────────────────────
  it('calls next(error) with statusCode 403 when no token is provided', () => {
    const req  = makeReq();
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/access token required/i);
  });

  // ── 4. Expired token ─────────────────────────────────────────────────────
  it('calls next(error) with statusCode 403 for an expired token', () => {
    const expiredErr = new Error('jwt expired');
    expiredErr.name  = 'TokenExpiredError';
    mockVerifyImpl.mockImplementation(() => { throw expiredErr; });

    const req  = makeReq({ cookies: { accessToken: 'expired.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/unauthorized/i);
  });

  // ── 5. Invalid/tampered token ─────────────────────────────────────────────
  it('calls next(error) with statusCode 403 for an invalid token', () => {
    const invalidErr = new Error('invalid signature');
    invalidErr.name  = 'JsonWebTokenError';
    mockVerifyImpl.mockImplementation(() => { throw invalidErr; });

    const req  = makeReq({ cookies: { accessToken: 'tampered.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/unauthorized/i);
  });

  // ── 6. NotBeforeError ────────────────────────────────────────────────────
  it('calls next(error) with statusCode 403 for a NotBeforeError', () => {
    const notBeforeErr = new Error('jwt not active');
    notBeforeErr.name  = 'NotBeforeError';
    mockVerifyImpl.mockImplementation(() => { throw notBeforeErr; });

    const req  = makeReq({ cookies: { accessToken: 'notbefore.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  // ── 7. Cookie takes precedence over header ────────────────────────────────
  it('prefers cookie token over Authorization header when both are present', () => {
    mockVerifyImpl.mockReturnValue({ id: 'cookie-user', email: 'cookie@example.com' });

    const req  = makeReq({
      cookies: { accessToken: 'cookie.token' },
      headers: { authorization: 'Bearer header.token' },
    });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(mockVerifyImpl).toHaveBeenCalledWith(
      'cookie.token',
      process.env.ACCESS_TOKEN_KEY,
      { algorithms: ['HS256'] }
    );
    expect(req.id).toBe('cookie-user');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// optionalAuth middleware
// ═══════════════════════════════════════════════════════════════════════════
describe('optionalAuth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Valid token → sets req.id ─────────────────────────────────────────
  it('sets req.id when a valid token is present', () => {
    mockVerifyImpl.mockReturnValue({ id: 'user-789', email: 'opt@example.com' });

    const req  = makeReq({ cookies: { accessToken: 'valid.optional.token' } });
    const res  = makeRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.id).toBe('user-789');
    expect(next).toHaveBeenCalledWith();
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 2. No token → calls next() without setting req.id ───────────────────
  it('calls next() without error when no token is present', () => {
    const req  = makeReq();
    const res  = makeRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.id).toBeUndefined();
    // next should be called with no arguments (no error)
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 3. Invalid token → soft fail, calls next() with no error ────────────
  it('calls next() without error when the token is invalid (soft fail)', () => {
    const invalidErr = new Error('invalid signature');
    invalidErr.name  = 'JsonWebTokenError';
    mockVerifyImpl.mockImplementation(() => { throw invalidErr; });

    const req  = makeReq({ cookies: { accessToken: 'bad.token' } });
    const res  = makeRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.id).toBeUndefined();
    expect(next).toHaveBeenCalled();
    // The critical check: optionalAuth must NOT pass the error to next
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 4. Expired token → soft fail ─────────────────────────────────────────
  it('calls next() without error when the token is expired (soft fail)', () => {
    const expiredErr = new Error('jwt expired');
    expiredErr.name  = 'TokenExpiredError';
    mockVerifyImpl.mockImplementation(() => { throw expiredErr; });

    const req  = makeReq({ cookies: { accessToken: 'expired.token' } });
    const res  = makeRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.id).toBeUndefined();
    expect(next.mock.calls[0].length).toBe(0);
  });
});
