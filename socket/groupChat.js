const Group = require('../models/group');
const GroupMessage = require('../models/groupMessage');

module.exports = (io, socket, connectedUsers) => {
    socket.on('joinGroupChat', async (groupId) => {
        try {
            const group = await Group.findById(groupId);
            if (!group) return socket.emit('error', { message: 'Group not found' });
            if (!group.members.includes(socket.userId))
                return socket.emit('error', { message: 'You are not a member' });

            socket.join(groupId);
            console.log(`User ${socket.userId} joined group ${groupId}`);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('leaveGroupChat', (groupId) => {
        socket.leave(groupId);
        console.log(`User ${socket.userId} left group ${groupId}`);
    });

    socket.on('sendGroupMessage', async ({ groupId, content }) => {
        try {
            if (!groupId || !content.trim()) return;

            const group = await Group.findById(groupId);
            if (!group) return socket.emit('error', { message: 'Group not found' });
            if (!group.members.includes(socket.userId))
                return socket.emit('error', { message: 'You are not a member' });

            const newMessage = await GroupMessage.create({
                groupId,
                sender: socket.userId,
                content: content.trim(),
            });

            await newMessage.populate('sender', 'name profilePic');
            io.to(groupId).emit('receiveGroupMessage', newMessage);
            socket.emit('messageSent', { success: true, messageId: newMessage._id });
            console.log('Group message saved:', newMessage);
        } catch (err) {
            console.error(err);
            socket.emit('error', { message: 'Failed to send group message' });
        }
    });

    socket.on('typingGroup', ({ groupId, isTyping }) => {
        socket.to(groupId).emit('userTypingGroup', { userId: socket.userId, isTyping });
    });
};
