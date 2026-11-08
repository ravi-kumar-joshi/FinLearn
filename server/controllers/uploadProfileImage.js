const User = require("../models/User");
const uploadProfileImage = async (req, res, next) => {
  const userId = req.id;

  try {
    const findedUser = await User.findById(userId);
    if (!findedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const { image } = req.body;
    if (image === null || image === "") {
      findedUser.profileImage = null;
    } else {
      if (!image.startsWith("data:image/")) {
        const error = new Error("Invalid image format. Expected base64 encoded image.");
        error.statusCode = 400;
        throw error;
      }
      findedUser.profileImage = image;
    }
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

