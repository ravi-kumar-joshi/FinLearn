// server/__tests__/setup.js
// Environment variables set BEFORE any module is imported
// (Jest runs setupFiles before the test framework loads)

process.env.SESSION_SECRET    = 'test-session-secret-for-jest-32chars!!';
process.env.ACCESS_TOKEN_KEY  = 'test-access-token-secret-for-jest-!!';
process.env.REFRESH_TOKEN_KEY = 'test-refresh-token-secret-for-jest!!';
process.env.MONGO_URL         = 'mongodb://localhost:27017/finlearn_test';
process.env.NODE_ENV          = 'test';
process.env.MAIL_USER         = 'test@example.com';
process.env.MAIL_PASSWORD     = 'test-mail-password';
process.env.GOOGLE_CLIENT_ID  = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.OPENROUTER_API_KEY   = 'test-openrouter-key';
process.env.ORIGIN               = 'http://localhost:5173';
