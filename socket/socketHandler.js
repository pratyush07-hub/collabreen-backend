
// // ==================== socket/socketHandler.js ====================
// const socketIO = require('socket.io');
// const jwt = require('jsonwebtoken');
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');

// let io;

// // Store connected users: { userId: socketId }
// const connectedUsers = new Map();

// const initializeSocket = (server) => {
//     io = socketIO(server, {
//         cors: {
//             origin: process.env.CLIENT_URL || 'http://localhost:5173',
//             credentials: true,
//             methods: ['GET', 'POST']
//         },
//         transports: ['websocket', 'polling']
//     });

//     // Authentication middleware
//     io.use(async (socket, next) => {
//         try {
        
//             const token = socket.handshake.auth.token;

//             console.log("Token from handshake:", token);

//             if (!token) {
//                 return next(new Error('Authentication error: Token not provided'));
//             }

//             // Verify JWT token
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             // console.log("Decoded token:", decoded);
//             socket.userId = decoded.userDetails.id;
//             socket.user = decoded.userDetails;

//             next();
//         } catch (error) {
//             console.error('Socket authentication error:', error);
//             next(new Error('Authentication error: Invalid token'));
//         }
//     });

//     io.on('connection', (socket) => {
//         // console.log(socket)
//         console.log(`User connected: ${socket.userId} (Socket ID: ${socket.id})`);

//         // Store user's socket connection
//         connectedUsers.set(socket.userId, socket.id);

//         // Emit online status to all users
//         socket.broadcast.emit('userOnline', socket.userId);

//         // Join chat room
//         socket.on('joinChat', (chatId) => {
//             socket.join(chatId);
            
//             console.log(`User ${socket.userId} joined chat: ${chatId}`);
//         });

//         // Leave chat room
//         socket.on('leaveChat', (chatId) => {
//             socket.leave(chatId);
//             console.log(`User ${socket.userId} left chat: ${chatId}`);
//         });

//         // Handle sending messages
//         socket.on('sendMessage', async (data) => {
//             try {
//                 const { chatId, content } = data;

//                 if (!chatId || !content || !content.trim()) {
//                     socket.emit('error', { message: 'Invalid message data' });
//                     return;
//                 }

//                 // Verify user is a participant of the chat
//                 const chat = await Chat.findById(chatId);
//                 if (!chat) {
//                     socket.emit('error', { message: 'Chat not found' });
//                     return;
//                 }

//                 if (!chat.participants.includes(socket.userId)) {
//                     socket.emit('error', { message: 'Unauthorized: Not a participant of this chat' });
//                     return;
//                 }

//                 // Create and save message to database
//                 const newMessage = await Message.create({
//                     chat: chatId,
//                     sender: socket.userId,
//                     content: content.trim(),
//                     readBy: [socket.userId] // Sender has read their own message
//                 });

//                 // Populate sender information
//                 await newMessage.populate('sender', 'name profilePic');

//                 // Update chat's lastMessage and updatedAt
//                 await Chat.findByIdAndUpdate(chatId, {
//                     lastMessage: newMessage._id,
//                     updatedAt: Date.now()
//                 });

//                 // Emit message to all users in the chat room
//                 io.to(chatId).emit('receiveMessage', newMessage);

//                 // Send confirmation to sender
//                 socket.emit('messageSent', {
//                     success: true,
//                     messageId: newMessage._id
//                 });

//                 // Notify other participants if they're online but not in chat room
//                 const otherParticipants = chat.participants.filter(
//                     participantId => participantId.toString() !== socket.userId
//                 );

//                 for (const participantId of otherParticipants) {
//                     const participantSocketId = connectedUsers.get(participantId.toString());
//                     if (participantSocketId) {
//                         // Send notification for new message
//                         io.to(participantSocketId).emit('newMessageNotification', {
//                             chatId,
//                             message: newMessage,
//                             from: socket.user.name || 'Unknown'
//                         });
//                     }
//                 }

//                 console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);
//             } catch (error) {
//                 console.error('Error sending message via socket:', error);
//                 socket.emit('error', {
//                     message: 'Failed to send message',
//                     details: error.message
//                 });
//             }
//         });

//         // Handle typing indicator
//         socket.on('typing', (data) => {
//             const { chatId, isTyping } = data;
//             socket.to(chatId).emit('userTyping', {
//                 userId: socket.userId,
//                 isTyping,
//                 chatId
//             });
//         });

//         // Handle message read status
//         socket.on('markAsRead', async (data) => {
//             try {
//                 const { chatId, messageId } = data;

//                 if (messageId) {
//                     // Mark specific message as read
//                     await Message.findByIdAndUpdate(messageId, {
//                         $addToSet: { readBy: socket.userId }
//                     });
//                 } else if (chatId) {
//                     // Mark all messages in chat as read
//                     await Message.updateMany(
//                         {
//                             chat: chatId,
//                             readBy: { $ne: socket.userId }
//                         },
//                         { $addToSet: { readBy: socket.userId } }
//                     );
//                 }

//                 // Notify other participants about read status
//                 socket.to(chatId).emit('messageRead', {
//                     chatId,
//                     messageId,
//                     readBy: socket.userId
//                 });
//             } catch (error) {
//                 console.error('Error marking message as read:', error);
//             }
//         });

//         // Handle disconnection
//         socket.on('disconnect', () => {
//             console.log(`User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
//             connectedUsers.delete(socket.userId);

//             // Emit offline status to all users
//             socket.broadcast.emit('userOffline', socket.userId);
//         });

//         // Handle errors
//         socket.on('error', (error) => {
//             console.error('Socket error:', error);
//         });
//     });

//     return io;
// };

// const getIO = () => {
//     if (!io) {
//         throw new Error('Socket.io not initialized');
//     }
//     return io;
// };

// const getConnectedUsers = () => {
//     return connectedUsers;
// };

// module.exports = {
//     initializeSocket,
//     getIO,
//     getConnectedUsers
// };


const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const connectedUsers = new Map();

const authMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: Token not provided'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userDetails.id;
        socket.user = decoded.userDetails;
        next();
    } catch (err) {
        console.error('Socket authentication error:', err);
        next(new Error('Authentication error: Invalid token'));
    }
};

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling']
    });

    io.use(authMiddleware);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId} (Socket ID: ${socket.id})`);
        connectedUsers.set(socket.userId, socket.id);

        // Broadcast online status
        socket.broadcast.emit('userOnline', socket.userId);

        // Import chat handlers
        require('./oneToOneChat')(io, socket, connectedUsers);
        require('./groupChat')(io, socket, connectedUsers);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            connectedUsers.delete(socket.userId);
            socket.broadcast.emit('userOffline', socket.userId);
        });

        socket.on('error', (err) => console.error('Socket error:', err));
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

module.exports = { initializeSocket, getIO, connectedUsers };
