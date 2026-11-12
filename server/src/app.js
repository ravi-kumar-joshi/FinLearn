/*
  server/src/app.js

  Purpose:
  - Configure and export the Express application used by the server.
  - Register middleware (CORS, sessions, body parsing, authentication)
    and mount route modules.

  Security fixes applied:
    #3  - CORS wildcard `*.vercel.app` removed; only exact origins are whitelisted.
    #6  - saveUninitialized changed to false (prevents session-fixation + GDPR issue).
*/

require("dotenv").config();

const express = require("express");
const passport = require("passport");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const strategy = require("../utils/googleStrategy.js");
const errorHandler = require("../middlewares/errorHandler.js");
const authRoutes = require("../routes/auth.js");
const courseRoutes = require("../routes/courses.js");
const adminRoutes = require("../routes/admin.js");
const certificateRoutes = require("../routes/certificateRoutes.js");
const chatRoutes = require("../routes/chat.js");

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in environment variables.");
}

const app = express();

app.set("trust proxy", 1);

// Exact-origin whitelist only.
// The previous `origin.endsWith('.vercel.app')` wildcard allowed any attacker
// who deploys to Vercel to make credentialed cross-origin requests to this API.
const allowedOrigins = [
  "http://localhost:5173",
  "https://fin-learn-client-ttsd.vercel.app",
  ...(process.env.ORIGIN ? [process.env.ORIGIN] : []),
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests (no Origin header) and known origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Block everything else — log for ops visibility.
      console.warn("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Session middleware configuration: controls cookie security and lifetime.
// `partitioned: true` adds the CHIPS (Cookies Having Independent Partitioned State)
// attribute — required for Android Chrome 118+ to accept cross-site session cookies.
// saveUninitialized set to false — sessions are only persisted when data
// has actually been written.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      partitioned: true, // CHIPS — prevents Android Chrome from blocking session cookie
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Body parsers and cookie parser for handling request payloads.
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Health-check endpoint for basic monitoring/heartbeat.
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Financial Literacy Hub API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use(passport.initialize());
app.use(passport.session());
strategy(app);

// Mount feature-specific route modules.
app.use("/user", authRoutes);
app.use("/courses", courseRoutes);

// Admin panel page redirect: if someone visits /admin as a page request,
// redirect them to the separate admin SPA entrypoint (admin.html).
app.get("/admin", (req, res) => {
  if (req.accepts("html")) {
    return res.redirect("/admin.html");
  }
  // For non-HTML requests, continue to API routes
  res.status(404).json({ message: "Not found" });
});

// Protect all admin API routes with auth + admin middleware
app.use("/admin", adminRoutes);
app.use("/certificates", certificateRoutes);
app.use("/api", chatRoutes);

// Simple route to expose current `req.user` info when authenticated.
app.get("/user/info", (req, res) => {
  res.status(200).json({
    message: "success",
    status: true,
    user: req?.user?._json,
  });
});

app.use(errorHandler);

module.exports = app;
