const Chat = require('../models/Chat');
const LikeRequest = require('../models/LikeRequest');
const Message = require('../models/Message');
const AppError = require('../utils/appError');

// Get user's chats (for ChatList)
// exports.getUserChats = async (req, res, next) => {
//     try {
//         const userId = req.user.id;
//         const chats = await Chat.find({ participants: userId })
//             .populate('participants', 'name profilePic')
//             .populate('lastMessage', 'content createdAt')
//             .sort({ updatedAt: -1 });

//         res.status(200).json({
//             success: true,
//             data: chats,
//         });
//     } catch (error) {
//         next(error);
//     }
// };



// controllers/chat.controller.js
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔹 Logged in user ID:", userId);

    // Fetch all chats where user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name profilePic')
      .populate('lastMessage', 'content createdAt sender')
      .sort({ updatedAt: -1 });

    console.log("✅ Chats found:", chats.length);

    return res.status(200).json({
      success: true,
      data: chats,
      message: "Fetched chats successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching chats",
    });
  }
};




// Get/create chat between two users
exports.getOrCreateChat = async (req, res, next) => {
    try {
        console.log("getOrCreateChat called", req.body);
        const participantId = req.body.participants; // Other user's ID
        const userId = req.user.id;
        let chat = await Chat.findOne({
            participants: { $all: [userId, participantId], $size: 2 }
        }).populate('participants', 'name profilePic');

        if (!chat) {
            chat = await Chat.create({ participants: [userId, participantId] });
            chat = await chat.populate('participants', 'name profilePic');
        }

        res.status(200).json({
            success: true,
            data: chat,
        });
    } catch (error) {
        next(error);
    }
};

// Get messages for a chat (for ChatWindow)
exports.getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id || req.user.id;

    // ✅ Fetch only messages not deleted for this user
    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: userId }, // <--- Filter here
    })
      .populate('sender', 'name profilePic')
      .populate('readBy', 'id')
      .populate('creatorProfile', 'profilePicture')
      .sort({ createdAt: 1 });

    // ✅ Mark messages as read
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
