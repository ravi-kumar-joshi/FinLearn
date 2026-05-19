/**
 * Create an admin user for development.
 * Usage: set ADMIN_EMAIL, ADMIN_PASSWORD in server/.env then run:
 *   node server/scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcrypt')

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@local.test'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'

async function run() {
    if (!MONGO_URI) throw new Error('MONGO_URL or MONGODB_URI missing in server/.env')
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    const found = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })
    if (found) {
        if (!found.isAdmin) { found.isAdmin = true; await found.save(); console.log('Marked existing user as admin') }
        else console.log('Admin already exists')
        process.exit(0)
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10)
    const u = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), password: hashed, isAdmin: true, status: 'active' })
    await u.save()
    console.log('Created admin:', ADMIN_EMAIL)
    process.exit(0)
}

run().catch(err => {
    console.error('Failed to seed admin:', err && err.message ? err.message : err)
    if (err && err.errors) { console.error(err.errors) }
    process.exit(1)
})
