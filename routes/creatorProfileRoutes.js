const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/auth");
const profileCheck = require("../middlewares/profileCheck");
const creatorProfileController = require("../controllers/creatorProfileController");
const { upload } = require("../middlewares/upload"); // ✅ use centralized upload middleware

// ✅ Protect all routes
router.use(checkAuth);

/* -------------------------------
   Routes that DON'T require complete profile
-------------------------------- */
router.post(
  "/setup",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  creatorProfileController.setupProfile
);

router.put(
  "/update",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  creatorProfileController.updateProfile
);

/* -------------------------------
   Apply Profile Check Middleware
-------------------------------- */
router.use(profileCheck);

/* -------------------------------
   Routes that REQUIRE complete profile
-------------------------------- */
router.get("/check-status", creatorProfileController.checkProfileStatus);
router.get("/me", creatorProfileController.getMyProfile);
router.get("/", creatorProfileController.getAllProfiles);
router.get("/:userId", creatorProfileController.getProfile);

router.post("/:userId/like", creatorProfileController.likeProfile);
router.get("/like-requests/pending", creatorProfileController.getPendingRequests);
router.put(
  "/like-requests/:requestId/respond",
  creatorProfileController.respondLikeRequest
);

module.exports = router;
