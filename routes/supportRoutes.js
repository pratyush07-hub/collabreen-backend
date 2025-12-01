const express = require("express");
const router = express.Router();
const { adminCheckAuth } = require("../middlewares/adminAuth");
const { sendUserMessage, adminReply, getAllUsersWithChats, getUserChat, getAdminChat } = require("../controllers/supportController");
const { checkAuth } = require("../middlewares/auth");

// User sends message
router.post("/send", checkAuth, sendUserMessage);

// User get his chat
router.get("/chat", checkAuth, getUserChat);

// Admin replies
router.post("/reply", adminCheckAuth, adminReply);

// Admin get all users who sent messages
router.get("/users", adminCheckAuth, getAllUsersWithChats);

// Admin opens specific chat
router.get("/chat/:userId", adminCheckAuth, getAdminChat);

module.exports = router;
