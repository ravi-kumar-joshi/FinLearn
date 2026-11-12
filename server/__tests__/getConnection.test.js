/**
 * Unit Test for getConnection.js
 * Verifies connection guard, configuration options, and lifecycle behavior.
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

describe('Database Connection Utility (getConnection.js)', () => {
  beforeEach(() => {
    delete process.env.MONGO_URL;
    delete process.env.MONGO_URI;
  });

  it('throws error when MONGO_URL is not configured in environment', async () => {
    const getConnection = require('../utils/getConnection');
    // Ensure disconnected state
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    await assert.rejects(
      async () => {
        await getConnection();
      },
      {
        message: 'MONGO_URL not configured in environment variables',
      }
    );
  });

  it('prevents duplicate connection when already connected (readyState === 1)', async () => {
    process.env.MONGO_URL = 'mongodb://localhost:27017/test_finlearn';
    let connectCalled = false;

    // Spy on mongoose.connect
    const origConnect = mongoose.connect;
    mongoose.connect = async () => {
      connectCalled = true;
      return mongoose;
    };

    // Simulate already connected
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    const getConnection = require('../utils/getConnection');
    const result = await getConnection();

    assert.equal(connectCalled, false, 'mongoose.connect must not be called when already connected');
    assert.equal(result, mongoose);

    // Restore
    mongoose.connect = origConnect;
  });

  it('prevents duplicate connection when connection is in progress (readyState === 2)', async () => {
    process.env.MONGO_URL = 'mongodb://localhost:27017/test_finlearn';
    let connectCalled = false;

    const origConnect = mongoose.connect;
    mongoose.connect = async () => {
      connectCalled = true;
      return mongoose;
    };

    // Simulate connecting in progress
    Object.defineProperty(mongoose.connection, 'readyState', { value: 2, configurable: true });

    const getConnection = require('../utils/getConnection');
    const result = await getConnection();

    assert.equal(connectCalled, false, 'mongoose.connect must not be called when connecting');
    assert.equal(result, mongoose);

    // Restore
    mongoose.connect = origConnect;
  });

  it('passes Atlas-optimized options without socketTimeoutMS or family:4', async () => {
    process.env.MONGO_URL = 'mongodb+srv://user:pass@cluster.mongodb.net/test';
    let passedOptions = null;
    let passedUrl = null;

    const origConnect = mongoose.connect;
    mongoose.connect = async (url, opts) => {
      passedUrl = url;
      passedOptions = opts;
      return { connection: { name: 'test', host: 'cluster.mongodb.net' } };
    };

    // Simulate disconnected state
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    const getConnection = require('../utils/getConnection');
    await getConnection();

    assert.equal(passedUrl, 'mongodb+srv://user:pass@cluster.mongodb.net/test');
    assert.ok(passedOptions, 'Options must be provided');
    assert.equal(passedOptions.maxPoolSize, 10);
    assert.equal(passedOptions.minPoolSize, 2);
    assert.equal(passedOptions.maxIdleTimeMS, 60000);
    assert.equal(passedOptions.serverSelectionTimeoutMS, 15000);
    assert.equal(passedOptions.socketTimeoutMS, undefined, 'socketTimeoutMS must be omitted to prevent 60s idle disconnects');
    assert.equal(passedOptions.family, undefined, 'family:4 must be omitted for Atlas SRV resolution');

    // Restore
    mongoose.connect = origConnect;
  });
});
