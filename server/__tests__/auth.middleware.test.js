/**
 * server/__tests__/auth.middleware.test.js
 *
 * Unit tests for the auth middleware (server/middlewares/auth.js).
 * These tests invoke the middleware function directly — no HTTP layer needed.
 *
 * Also preserves the original optionalAuth tests from the previous version.
 */

// ─── Mock jsonwebtoken BEFORE importing the middleware ─────────────────────
let mockVerifyImpl = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign:   jest.fn().mockReturnValue('mock-token'),
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

// =============================================================================
// auth middleware
// =============================================================================

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Valid token in cookie — sets req.id + req.email ──────────────────────
  it('calls next() with decoded id/email when valid token is in cookie', () => {
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
    // next() must be called with NO arguments (not an error)
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 2. Valid token in Authorization header ───────────────────────────────────
  it('calls next() with decoded id/email when valid token is in Authorization header', () => {
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
    expect(req.email).toBe('bearer@example.com');
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 3. No token at all — 403 ─────────────────────────────────────────────────
  it('calls next(error) with statusCode 403 when no token is provided', () => {
    const req  = makeReq(); // empty cookies + empty headers
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/access token required/i);
  });

  // ── 4. password_reset token — 403 ────────────────────────────────────────────
  it('calls next(error) with statusCode 403 when token purpose is password_reset', () => {
    // Decoded token has purpose === 'password_reset'
    mockVerifyImpl.mockReturnValue({
      id:      'user-789',
      email:   'reset@example.com',
      purpose: 'password_reset',
    });

    const req  = makeReq({ cookies: { accessToken: 'reset.purpose.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/password reset token/i);
  });

  // ── 5. TokenExpiredError — 403 ────────────────────────────────────────────────
  it('calls next(error) with statusCode 403 on TokenExpiredError', () => {
    const expiredErr  = new Error('jwt expired');
    expiredErr.name   = 'TokenExpiredError';
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

  // ── 6. JsonWebTokenError — 403 ───────────────────────────────────────────────
  it('calls next(error) with statusCode 403 on JsonWebTokenError', () => {
    const invalidErr  = new Error('invalid signature');
    invalidErr.name   = 'JsonWebTokenError';
    mockVerifyImpl.mockImplementation(() => { throw invalidErr; });

    const req  = makeReq({ cookies: { accessToken: 'tampered.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/unauthorized/i);
  });

  // ── 7. NotBeforeError — 403 ──────────────────────────────────────────────────
  it('calls next(error) with statusCode 403 on NotBeforeError', () => {
    const notBeforeErr  = new Error('jwt not active');
    notBeforeErr.name   = 'NotBeforeError';
    mockVerifyImpl.mockImplementation(() => { throw notBeforeErr; });

    const req  = makeReq({ cookies: { accessToken: 'notbefore.jwt.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/unauthorized/i);
  });

  // ── 8. Sets req.id and req.email from decoded token ───────────────────────────
  it('sets req.id and req.email correctly from the decoded token payload', () => {
    const decoded = { id: 'decoded-user-id', email: 'decoded@example.com' };
    mockVerifyImpl.mockReturnValue(decoded);

    const req  = makeReq({ cookies: { accessToken: 'any.valid.token' } });
    const res  = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(req.id).toBe('decoded-user-id');
    expect(req.email).toBe('decoded@example.com');
    // next() with no args = success
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 9. Cookie takes precedence over header ────────────────────────────────────
  it('prefers cookie token over Authorization header when both are present', () => {
    mockVerifyImpl.mockReturnValue({ id: 'cookie-user', email: 'cookie@example.com' });

    const req = makeReq({
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

// =============================================================================
// optionalAuth middleware
// =============================================================================

describe('optionalAuth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Valid token → sets req.id ─────────────────────────────────────────────
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

  // ── 2. No token → calls next() without setting req.id ────────────────────────
  it('calls next() without error when no token is present', () => {
    const req  = makeReq();
    const res  = makeRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.id).toBeUndefined();
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0].length).toBe(0);
  });

  // ── 3. Invalid token → soft fail, next() with no error ───────────────────────
  it('calls next() without error when the token is invalid (soft fail)', () => {
    const invalidErr  = new Error('invalid signature');
    invalidErr.name   = 'JsonWebTokenError';
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

  // ── 4. Expired token → soft fail ─────────────────────────────────────────────
  it('calls next() without error when the token is expired (soft fail)', () => {
    const expiredErr  = new Error('jwt expired');
    expiredErr.name   = 'TokenExpiredError';
    mockVerifyImpl.mockImplementation(() => { throw expiredErr; });

    const req  = makeReq({ cookies: { accessToken: 'expired.token' } });
    const res  = makeRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.id).toBeUndefined();
    expect(next.mock.calls[0].length).toBe(0);
  });
});
