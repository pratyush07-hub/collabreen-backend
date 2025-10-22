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

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  const absolutePath = path.resolve(localFilePath);

  try {
    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded to Cloudinary:", response.secure_url);

    // Delete local file safely
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath); // sync delete
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Clean up local file on error too
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    return null;
  }
};

module.exports = { uploadOnCloudinary };
