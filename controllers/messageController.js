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