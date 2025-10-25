const Message = require('../models/Message');
const Chat = require('../models/Chat');

module.exports = (io, socket, connectedUsers) => {
    // Join a 1:1 chat room
    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // Send 1:1 message
    socket.on('sendMessage', async ({ chatId, content }) => {
        try {
            if (!chatId || !content.trim()) return;

            const chat = await Chat.findById(chatId);
            if (!chat) return socket.emit('error', { message: 'Chat not found' });
            if (!chat.participants.includes(socket.userId))
                return socket.emit('error', { message: 'Unauthorized' });

            const newMessage = await Message.create({
                chat: chatId,
                sender: socket.userId,
                content: content.trim(),
                readBy: [socket.userId],
            });

            await newMessage.populate('sender', 'name profilePic');
            await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: Date.now() });

            io.to(chatId).emit('receiveMessage', newMessage);

            // Notify offline participants
            chat.participants
                .filter((p) => p.toString() !== socket.userId)
                .forEach((participantId) => {
                    const sid = connectedUsers.get(participantId.toString());
                    if (sid) {
                        io.to(sid).emit('newMessageNotification', {
                            chatId,
                            message: newMessage,
                            from: socket.user.name,
                        });
                    }
                });

            socket.emit('messageSent', { success: true, messageId: newMessage._id });
            console.log(`Message sent in chat ${chatId} by ${socket.userId}`);
        } catch (err) {
            console.error(err);
            socket.emit('error', { message: 'Failed to send message', details: err.message });
        }
    });

    // Typing indicator
    socket.on('typing', ({ chatId, isTyping }) => {
        socket.to(chatId).emit('userTyping', { userId: socket.userId, isTyping });
    });

    // Mark messages as read
    socket.on('markAsRead', async ({ chatId, messageId }) => {
        try {
            if (messageId) {
                await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: socket.userId } });
            } else if (chatId) {
                await Message.updateMany(
                    { chat: chatId, readBy: { $ne: socket.userId } },
                    { $addToSet: { readBy: socket.userId } }
                );
            }
            socket.to(chatId).emit('messageRead', { chatId, messageId, readBy: socket.userId });
        } catch (err) {
            console.error(err);
        }
    });
};
