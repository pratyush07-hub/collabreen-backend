const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/multer");
const { createGroup, getAllGroups, joinGroup, leaveGroup, getGroupById } = require("../controllers/groupController");
const { checkAuth } = require("../middlewares/auth");
const { getGroupMessages, sendGroupMessage, deleteGroupMessageForMe, deleteGroupMessageForEveryone, sendAudioMessage, sendGroupAudioMessage } = require("../controllers/groupMessageController");



// All collaboration routes protected by authentication
router.use(checkAuth);

// POST → Create group with image upload
router.post("/create", upload.single("image"), createGroup);

// GET → Fetch all groups
router.get("/", getAllGroups);
router.get("/:id", getGroupById);

router.post("/:groupId/join", joinGroup);
router.post("/:groupId/leave", leaveGroup);

router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/message", sendGroupMessage);

router.post("/send-audio/:groupId", upload.single("audio"), sendGroupAudioMessage);


router.delete('/messages/:messageId/delete-for-me', deleteGroupMessageForMe);
router.delete('/messages/:messageId/delete-for-everyone', deleteGroupMessageForEveryone);

module.exports = router;
