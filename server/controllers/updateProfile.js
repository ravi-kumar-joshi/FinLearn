/**
 * Update Profile Controller
 * 
 * Updates user profile information (name only)
 * Email changes require separate verification flow
 * 
 * @module controllers/updateProfile
 * @async
 * @param {Object} req.body - Request body
 * @param {string} [req.body.name] - User's new name
 * @returns {Object} Success response with updated user data
 * @throws {Error} 404 - User not found
 * @throws {Error} 400 - Email change attempted
 */

const User = require("../models/User");

const updateProfile = async (req, res, next) => {
  const userId = req.id;
  const { name, email, phone, location, bio, occupation, website, twitter, linkedin, github } = req.body;

  try {
    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Email cannot be changed through this endpoint - use email verification flow
    if (email && email !== findedUser.email) {
      const error = new Error("Email cannot be changed directly. Please use email verification.");
      error.statusCode = 400;
      throw error;
    }

    // Update profile fields if provided
    if (name) findedUser.name = name;
    if (phone) findedUser.phone = phone;
    if (location) findedUser.location = location;
    if (bio) findedUser.bio = bio;
    if (occupation) findedUser.occupation = occupation;
    if (website) findedUser.website = website;
    if (twitter) findedUser.twitter = twitter;
    if (linkedin) findedUser.linkedin = linkedin;
    if (github) findedUser.github = github;

    // IMPORTANT: Only validate modified fields to avoid enum validation errors
    // on unchanged onboarding fields
    await findedUser.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: "Profile updated successfully",
      status: true,
      user: {
        name: findedUser.name,
        email: findedUser.email,
        phone: findedUser.phone,
        location: findedUser.location,
        bio: findedUser.bio,
        occupation: findedUser.occupation,
        website: findedUser.website,
        twitter: findedUser.twitter,
        linkedin: findedUser.linkedin,
        github: findedUser.github,
        profileImage: findedUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateProfile;

