const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/auth');
const chatController = require('../controllers/chatController');
const messageController = require('../controllers/messageController');
const Message = require('../models/Message');
const { upload } = require('../middlewares/upload.js');

// All chat routes protected by authentication
router.use(checkAuth);

// Get all chats for the authenticated user
router.get('/', chatController.getUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', chatController.getChatMessages);

// Create a new chat (e.g., between two users)
router.post('/', chatController.getOrCreateChat);

// Send a message in a specific chat
router.post('/:chatId/messages', messageController.sendMessage);


router.post("/:chatId/send-audio", upload.single("audio"), messageController.sendAudioMessage);

module.exports = router;


// Mark messages as read
// router.put('/:chatId/messages/read', messageController.markMessagesAsRead);

// module.exports = {router};
