/**
 * Database Connection Utility (MongoDB Atlas Resilient)
 *
 * Establishes, monitors, and manages the Mongoose connection lifecycle to MongoDB.
 *
 * ROOT CAUSES OF PREVIOUS DISCONNECTION / RECONNECTION LOOP:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. `socketTimeoutMS: 60000`:
 *    Forcibly terminated active TCP sockets in the connection pool after 60 seconds
 *    of idle time (no database queries). When the idle timer expired, the driver
 *    destroyed the socket -> Mongoose emitted 'disconnected' -> the topology
 *    monitor immediately reconnected -> Mongoose emitted 'connected'.
 *    This created an endless 60-second disconnect/reconnect cycle during idle periods.
 *    Fix: Removed socketTimeoutMS (defaults to 0 / no idle socket kill).
 *
 * 2. `family: 4`:
 *    Forced IPv4-only DNS resolution. MongoDB Atlas uses DNS SRV records
 *    (`mongodb+srv://`) that map to multiple replica set nodes. In modern Node.js
 *    (v18+ / v20+ / v24+), forcing IPv4 interferes with the native dual-stack
 *    Happy Eyeballs resolver and Atlas replica set member heartbeat monitoring,
 *    causing intermittent heartbeat drops and reconnection spikes.
 *    Fix: Removed family: 4 to allow native DNS resolution for Atlas SRV clusters.
 *
 * 3. Connection State Guard (`readyState`):
 *    Calling `getConnection()` when a connection was already open (readyState === 1)
 *    or connecting (readyState === 2) created duplicate connection attempts on the
 *    default connection.
 *    Fix: Added readyState guard.
 *
 * 4. Duplicate Event Listeners:
 *    Connection listeners were attached inside the function body on every call,
 *    stacking duplicate event listeners on mongoose.connection.
 *    Fix: Listeners are registered once at the module level.
 *
 * 5. Complete Graceful Shutdown:
 *    Handled both SIGINT and SIGTERM for cloud environments (Render, Heroku, Docker).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const mongoose = require("mongoose");

// Flag to guarantee connection event listeners are attached exactly once
let listenersAttached = false;

/**
 * Register connection lifecycle listeners once at module level.
 * Preserves all existing logging strings without modification.
 */
const setupConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    console.log("🔗 Mongoose connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ Mongoose disconnected");
  });
};

// Initialize listeners
setupConnectionListeners();

/**
 * Graceful shutdown handler for process termination signals.
 * Handles both SIGINT (Ctrl+C / nodemon) and SIGTERM (Docker / cloud hosts).
 */
const gracefulShutdown = async (signal) => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(`🛑 Connection closed due to ${signal}`);
    }
  } catch (err) {
    console.error("Error during graceful shutdown:", err.message);
  } finally {
    process.exit(0);
  }
};

process.once("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));

/**
 * Connect to MongoDB with production-grade Atlas options.
 *
 * @returns {Promise<typeof mongoose>} Mongoose instance
 */
const getConnection = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;

    if (!mongoUrl) {
      throw new Error("MONGO_URL not configured in environment variables");
    }

    // ── Guard: Prevent duplicate connection attempts ──────────────────────────
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }
    if (mongoose.connection.readyState === 2) {
      return mongoose;
    }

    /**
     * Atlas-Optimized Connection Configuration:
     * - maxPoolSize: 10 — Keeps connection usage within Atlas Free/Shared tier limits.
     * - minPoolSize: 2 — Keeps 2 warm connections open to avoid cold-start delays.
     * - maxIdleTimeMS: 60000 — Gracefully rotates sockets idle for 60s before cloud NATs drop them.
     * - serverSelectionTimeoutMS: 15000 — Fails fast with clean error if Atlas is unreachable.
     * - (Omitted socketTimeoutMS) — Prevents killing healthy idle connections.
     * - (Omitted family: 4) — Lets Node.js native DNS resolve Atlas SRV records correctly.
     */
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 15000,
    };

    const connection = await mongoose.connect(mongoUrl, options);

    console.log("✅ Database connected successfully");
    if (connection.connection) {
      console.log(`💾 Database: ${connection.connection.name}`);
      console.log(`🌍 Host: ${connection.connection.host}`);
    }

    return connection;
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    throw error;
  }
};

module.exports = getConnection;
