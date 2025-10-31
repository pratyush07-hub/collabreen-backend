// const Message = require('../models/Message');
// const Chat = require('../models/Chat');

// // Send message
// exports.sendMessage = async (req, res, next) => {
//     try {
//         const { chatId } = req.params;
//         const { content } = req.body;
//         const senderId = req.user.id;

//         const chat = await Chat.findById(chatId);
//         if (!chat || !chat.participants.includes(senderId)) {
//             return next(new AppError('Unauthorized access to chat', 403));
//         }

//         const message = await Message.create({
//             chat: chatId,
//             sender: senderId,
//             content,
//         });

//         // Update chat's lastMessage
//         await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

//         const populatedMessage = await message.populate('sender', 'name profilePic');

//         res.status(201).json({
//             success: true,
//             data: populatedMessage,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const Message = require('../models/Message');
const Chat = require('../models/Chat');
const AppError = require('../utils/appError');
const { getIO } = require('../socket/socketHandler');
const cloudinary = require("cloudinary").v2;





// REST API fallback - send message (works alongside WebSocket)
exports.sendMessage = async (req, res, next) => {
    try {
        console.log("User is here", req.user);
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;
        

        // Verify user is a participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(senderId)) {
            return next(new AppError('Unauthorized access to chat', 403));
        }

        // Create message
        const message = await Message.create({
            chat: chatId,
            sender: senderId,
            creatorProfile:senderId, // Assuming creatorProfile is same as sender for now
            content,
            messageType: "text"
        });

        // Update chat's lastMessage
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        // Populate sender information
        const populatedMessage = await message.populate('sender', 'name profilePic');

        // Emit via WebSocket if available
        try {
            const io = getIO();
            io.to(chatId).emit('receiveMessage', populatedMessage);
        } catch (error) {
            console.log('WebSocket not available, message saved to DB only');
        }

        res.status(201).json({
            success: true,
            data: populatedMessage,
        });
    } catch (error) {
        next(error);
    }
};

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.sendAudioMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const senderId = req.user.id;

    console.log("🎧 Incoming audio message from:", senderId);
    console.log("📂 File mimetype:", req.file?.mimetype);
    console.log("📦 File received:", req.file);
console.log("🧱 Buffer length:", req.file?.buffer?.length);


    if (!req.file) {
      return next(new AppError("No audio file uploaded", 400));
    }
    


    // Verify user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(senderId)) {
      return next(new AppError("Unauthorized access to chat", 403));
    }

    // Upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    console.log("Uploaded audio to Cloudinary:", cloudinaryResult.secure_url);

    // Create message
    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      creatorProfile: senderId,
      content: "", // no text content
      audioUrl: cloudinaryResult.secure_url,
      messageType: "audio", // optional field in schema
    });

    // Update chat's lastMessage
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const populatedMessage = await message.populate("sender", "name profilePic");

    // Emit real-time message
    try {
      const io = getIO();
      io.to(chatId).emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.log("WebSocket not available, message saved only");
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (err) {
    console.error("❌ Error in sendAudioMessage:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
