const User = require("../models/User");

/**
 * Upload Profile Image Controller
 * 
 * Handles profile image upload and removal
 * Accepts base64 encoded images
 * 
 * @module controllers/uploadProfileImage
 * @async
 * @param {Object} req.body - Request body
 * @param {string|null} req.body.image - Base64 encoded image or null to remove
 * @returns {Object} Success response with image URL
 * @throws {Error} 404 - User not found
 * @throws {Error} 400 - Invalid image format
 */

const uploadProfileImage = async (req, res, next) => {
  const userId = req.id;

  try {
    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // For now, we'll accept base64 image data
    // In production, you'd want to use a service like AWS S3, Cloudinary, etc.
    const { image } = req.body;

    // If image is null, remove the profile image
    if (image === null || image === "") {
      findedUser.profileImage = null;
    } else {
      // Validate base64 image format
      if (!image.startsWith("data:image/")) {
        const error = new Error("Invalid image format. Expected base64 encoded image.");
        error.statusCode = 400;
        throw error;
      }

      // Store the base64 image (in production, upload to cloud storage and store URL)
      findedUser.profileImage = image;
    }

    // IMPORTANT: Only validate modified fields to avoid enum validation errors
    // on unchanged onboarding fields
    await findedUser.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: image ? "Profile image updated successfully" : "Profile image removed successfully",
      status: true,
      profileImage: findedUser.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = uploadProfileImage;

