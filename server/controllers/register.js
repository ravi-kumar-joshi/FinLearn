/**
 * User Registration Controller
 *
 * Creates a new user account with email and password.
 * Passwords are hashed using bcrypt before storage.
 *
 * @module controllers/register
 * @async
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password (will be hashed)
 * @returns {Object} Success response
 * @throws {Error} 400 - User already exists or validation failed
 *
 * Security fixes applied:
 *   #7  - name is now sanitized: HTML angle brackets stripped, length validated
 *         (2–100 chars). Prevents stored-XSS when the name is rendered in the
 *         admin dashboard without escaping.
 */

const User = require("../models/User");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      const error = new Error("Name, email, and password are required");
      error.statusCode = 400;
      throw error;
    }

    // FIX #7: Sanitize and validate name before storing.
    // Strip HTML angle-bracket characters to block stored-XSS payloads
    // (e.g. <script>alert(1)</script> in the name field).
    const sanitizedName = name.trim().replace(/[<>]/g, "");
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      const error = new Error("Name must be between 2 and 100 characters");
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    // Validate password length
    if (password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists
    const findedUser = await User.findOne({ email: email.toLowerCase() });
    if (findedUser) {
      const error = new Error("User with this email already exists");
      error.statusCode = 400;
      throw error;
    }

    // Hash password (10 salt rounds for good security/performance balance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with sanitized name
    const newUser = new User({
      name: sanitizedName,            // FIX #7: use sanitized value
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    // Return success (don't send password back)
    res.status(201).json({
      message: "User registered successfully",
      status: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = register;
