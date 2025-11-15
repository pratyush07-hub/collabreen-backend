// multer.js
const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Serverless-safe temp folder
const tempDir = path.join(os.tmpdir(), "uploads");

// Create temp folder if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/",
    "video/",
    "audio/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain",
  ];

  const isValid = allowedTypes.some((type) => file.mimetype.startsWith(type));

  if (!isValid) cb(new Error("Unsupported file type"), false);
  else cb(null, true);
};

// Max file size: 20MB
const uploadMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = { uploadMulter, tempDir };
