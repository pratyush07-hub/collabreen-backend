const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/multer");
const { createGroup, getAllGroups, joinGroup, leaveGroup } = require("../controllers/groupController");
const { checkAuth } = require("../middlewares/auth");


// All collaboration routes protected by authentication
router.use(checkAuth);

// POST → Create group with image upload
router.post("/create", upload.single("image"), createGroup);

// GET → Fetch all groups
router.get("/", getAllGroups);

router.post("/:groupId/join", joinGroup);
router.post("/:groupId/leave", leaveGroup);

module.exports = router;
