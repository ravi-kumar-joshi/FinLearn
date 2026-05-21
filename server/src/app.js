/*
  server/src/app.js

  Purpose:
  - Configure and export the Express application used by the server.
  - Register middleware (CORS, sessions, body parsing, authentication)
    and mount route modules.

  Notes for new developers:
  - Environment variables control session cookie behavior and allowed origin.
  - `strategy(app)` wires up passport/google OAuth handlers.
  - Routes are organized under `routes/` and mounted with feature prefixes.
*/

require('dotenv').config();

import express, { json, urlencoded } from 'express';
import { initialize, session as _session } from 'passport';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import strategy from '../utils/googleStrategy';
import errorHandler from '../middlewares/errorHandler';
import authRoutes from '../routes/auth';
import courseRoutes from '../routes/courses';
import adminRoutes from '../routes/admin';
import certificateRoutes from '../routes/certificateRoutes';

// SESSION_SECRET is required to sign session cookies. The app will refuse
// to start if it's missing to prevent insecure default behavior.
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in environment variables.');
}

const app = express();

// CORS configuration: allow requests from configured origin and send
// credentials (cookies) so authentication works across origins during dev.
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// Session middleware configuration: controls cookie security and lifetime.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // Only set secure & sameSite none when in production behind TLS.
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Body parsers and cookie parser for handling request payloads.
app.use(json({ limit: '10mb' }));
app.use(cookieParser());
app.use(urlencoded({ extended: false, limit: '10mb' }));

// Health-check endpoint for basic monitoring/heartbeat.
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Financial Literacy Hub API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Passport (authentication) initialization and wiring of the Google strategy.
app.use(initialize());
app.use(_session());
strategy(app);

// Mount feature-specific route modules. Each module handles its own
// internal routes and controllers.
app.use('/user', authRoutes);
app.use('/courses', courseRoutes);
app.use('/admin', adminRoutes);
app.use('/certificates', certificateRoutes);

// Simple route to expose current `req.user` info when authenticated.
app.get('/user/info', (req, res) => {
  res.status(200).json({
    message: 'success',
    status: true,
    user: req?.user?._json,
  });
});

// Centralized error handler middleware - last middleware in the chain.
app.use(errorHandler);

export default app;
