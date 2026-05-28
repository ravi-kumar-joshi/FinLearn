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

const express = require('express');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const strategy = require('../utils/googleStrategy.js');
const errorHandler = require('../middlewares/errorHandler.js');
const authRoutes = require('../routes/auth.js');
const courseRoutes = require('../routes/courses.js');
const adminRoutes = require('../routes/admin.js');
const certificateRoutes = require('../routes/certificateRoutes.js');
const chatRoutes = require('../routes/chat.js');

// SESSION_SECRET is required to sign session cookies. The app will refuse
// to start if it's missing to prevent insecure default behavior.
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in environment variables.');
}

const app = express();

app.set('trust proxy', 1);

// CORS configuration: allow requests from configured origin and send
// credentials (cookies) so authentication works across origins during dev.
app.use(
  cors({
    origin: 'http://localhost:5173',
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
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Body parsers and cookie parser for handling request payloads.
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

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
app.use(passport.initialize());
app.use(passport.session());
strategy(app);

// Mount feature-specific route modules. Each module handles its own
// internal routes and controllers.
app.use('/user', authRoutes);
app.use('/courses', courseRoutes);
app.use('/admin', adminRoutes);
app.use('/certificates', certificateRoutes);
app.use('/api', chatRoutes); 

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

module.exports = app;
