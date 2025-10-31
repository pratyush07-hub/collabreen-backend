const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 🔹 Allow all common file types
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

  if (!isValid) {
    cb(new Error("Unsupported file type"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = { upload };
