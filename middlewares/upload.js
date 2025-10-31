const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/",
      "audio/webm",
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/ogg",
      "audio/x-m4a",
    ];

    if (
      !allowedTypes.some((type) => file.mimetype.startsWith(type) || file.mimetype === type)
    ) {
      return cb(new Error("Unsupported file type"), false);
    }

    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = { upload };
