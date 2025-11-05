const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/auth'); // Your existing auth
const profileCheck = require('../middlewares/profileCheck');
const creatorProfileController = require('../controllers/creatorProfileController');
// All routes protected
router.use(checkAuth);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads', 'creator');

        // Ensure folder exists
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // unique filename: profilePicture-12345.jpg
        const ext = path.extname(file.originalname);
        const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

// Init Multer with storage
const upload = multer({ storage });

// Routes that DON'T require complete profile (placed BEFORE profileCheck middleware)
router.post(
    '/setup',
    upload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 }
    ]),
    creatorProfileController.setupProfile
);

router.put(
    '/update',
  upload.fields([
      { name: 'profilePicture', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
]),
creatorProfileController.updateProfile
);

router.use(profileCheck);

router.get('/check-status', creatorProfileController.checkProfileStatus); // Move this here!

// Routes that require complete profile (placed AFTER profileCheck middleware)


router.post('/:userId/like', creatorProfileController.likeProfile);
router.get('/like-requests/pending', creatorProfileController.getPendingRequests);
router.put('/like-requests/:requestId/respond', creatorProfileController.respondLikeRequest);
// router.get('/', creatorProfileController.getAllProfiles);
router.get('/me', creatorProfileController.getMyProfile);
// router.get('/:userId', creatorProfileController.getProfile);
// router.put('/:userId', creatorProfileController.updateProfile);
router.post('/:userId/like', creatorProfileController.likeProfile);

// Get all profiles for swiping
router.get('/', creatorProfileController.getAllProfiles);

// Get a specific profile
router.get('/:userId', creatorProfileController.getProfile);

// Like a profile
// router.post('/:userId/like', creatorProfileController.likeProfile);

// router.put('/update', creatorProfileController.updateProfile);



module.exports = router;