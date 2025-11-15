const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes the local file after upload
 * @param {string} localFilePath - path to the local file
 * @returns {Promise<Object|null>} - Cloudinary response object or null if failed
 */
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  const absolutePath = path.resolve(localFilePath);

  try {
    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto", // supports images, videos, audio, etc.
    });

    console.log("File uploaded to Cloudinary:", response.secure_url);

    // Delete local file safely
    fs.promises.unlink(absolutePath).catch(() => {
      console.warn("Local file deletion failed:", absolutePath);
    });

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Attempt cleanup even if upload fails
    fs.promises.unlink(absolutePath).catch(() => {
      console.warn("Local file deletion failed after upload error:", absolutePath);
    });

    return null;
  }
};

module.exports = { uploadOnCloudinary };
