// const Group = require('../models/group');
// const GroupMessage = require('../models/groupMessage');

// module.exports = (io, socket, connectedUsers) => {
//     socket.on('joinGroupChat', async (groupId) => {
//         try {
//             const group = await Group.findById(groupId);
//             if (!group) return socket.emit('error', { message: 'Group not found' });
//             if (!group.members.includes(socket.userId))
//                 return socket.emit('error', { message: 'You are not a member' });

//             socket.join(groupId);
//             console.log(`User ${socket.userId} joined group ${groupId}`);
//         } catch (err) {
//             console.error(err);
//         }
//     });

//     socket.on('leaveGroupChat', (groupId) => {
//         socket.leave(groupId);
//         console.log(`User ${socket.userId} left group ${groupId}`);
//     });

//     socket.on('sendGroupMessage', async ({ groupId, content }) => {
//         try {
//             if (!groupId || !content.trim()) return;

//             const group = await Group.findById(groupId);
//             if (!group) return socket.emit('error', { message: 'Group not found' });
//             if (!group.members.includes(socket.userId))
//                 return socket.emit('error', { message: 'You are not a member' });

//             const newMessage = await GroupMessage.create({
//                 groupId,
//                 sender: socket.userId,
//                 content: content.trim(),
//             });

//             await newMessage.populate('sender', 'name profilePic');
//             io.to(groupId).emit('receiveGroupMessage', newMessage);
//             socket.emit('messageSent', { success: true, messageId: newMessage._id });
//             console.log('Group message saved:', newMessage);
//         } catch (err) {
//             console.error(err);
//             socket.emit('error', { message: 'Failed to send group message' });
//         }
//     });

//     socket.on('typingGroup', ({ groupId, isTyping }) => {
//         socket.to(groupId).emit('userTypingGroup', { userId: socket.userId, isTyping });
//     });
// };


const Group = require('../models/group');
const GroupMessage = require('../models/groupMessage');

module.exports = (io, socket, connectedUsers) => {

  // 🟢 Join Group
  socket.on('joinGroupChat', async (groupId) => {
    try {
      const group = await Group.findById(groupId);
      if (!group) return socket.emit('error', { message: 'Group not found' });
      if (!group.members.includes(socket.userId))
        return socket.emit('error', { message: 'You are not a member of this group' });

      socket.join(groupId);
      console.log(`✅ User ${socket.userId} joined group ${groupId}`);
    } catch (err) {
      console.error('joinGroupChat error:', err);
      socket.emit('error', { message: 'Failed to join group' });
    }
  });

  // 🔴 Leave Group
  socket.on('leaveGroupChat', (groupId) => {
    socket.leave(groupId);
    console.log(`🚪 User ${socket.userId} left group ${groupId}`);
  });

  // 💬 Send Text Message
  socket.on('sendGroupMessage', async ({ groupId, content }) => {
    try {
      if (!groupId || !content?.trim()) return;

      const group = await Group.findById(groupId);
      if (!group) return socket.emit('error', { message: 'Group not found' });
      if (!group.members.includes(socket.userId))
        return socket.emit('error', { message: 'You are not a member of this group' });

      const newMessage = await GroupMessage.create({
        groupId,
        sender: socket.userId,
        content: content.trim(),
      });

      await newMessage.populate('sender', 'name profilePic');
      io.to(groupId).emit('receiveGroupMessage', newMessage);

      socket.emit('messageSent', { success: true, messageId: newMessage._id });
      console.log('💾 Group text message saved:', newMessage);
    } catch (err) {
      console.error('sendGroupMessage error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // 🎙️ Send Audio Message
  socket.on('sendAudioMessage', async ({ groupId, audioUrl }) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) return socket.emit('error', { message: 'Group not found' });
    if (!group.members.includes(socket.userId))
      return socket.emit('error', { message: 'Not a member of group' });

    const newAudioMsg = await GroupMessage.create({
      groupId,
      sender: socket.userId,
      audioUrl,
      type: 'audio',
    });

    await newAudioMsg.populate('sender', 'name profilePic');
    io.to(groupId).emit('receiveGroupAudio', newAudioMsg);
    console.log('🎧 Audio message emitted to group:', groupId);
  } catch (err) {
    console.error('sendAudioMessage error:', err);
    socket.emit('error', { message: 'Failed to send audio' });
  }
});


  // 🗑️ Delete Message (for me)
  socket.on('deleteGroupMessageForMe', async ({ messageId }) => {
    try {
      const msg = await GroupMessage.findById(messageId);
      if (!msg) return socket.emit('error', { message: 'Message not found' });

      if (!msg.deletedFor.includes(socket.userId)) {
        msg.deletedFor.push(socket.userId);
        await msg.save();
      }

      socket.emit('messageDeletedForMe', { messageId });
      console.log(`🗑️ Message ${messageId} deleted for user ${socket.userId}`);
    } catch (err) {
      console.error('deleteGroupMessageForMe error:', err);
      socket.emit('error', { message: 'Failed to delete message for me' });
    }
  });

  // 🗑️ Delete for Everyone
  socket.on('deleteGroupMessageForEveryone', async ({ messageId, groupId }) => {
    try {
      const msg = await GroupMessage.findById(messageId);
      if (!msg) return socket.emit('error', { message: 'Message not found' });

      if (msg.sender.toString() !== socket.userId)
        return socket.emit('error', { message: 'Only the sender can delete for everyone' });

      msg.isDeletedForEveryone = true;
      msg.content = '';
      msg.audioUrl = '';
      await msg.save();

      io.to(groupId).emit('messageDeletedForEveryone', { messageId });
      console.log(`🚮 Message ${messageId} deleted for everyone in group ${groupId}`);
    } catch (err) {
      console.error('deleteGroupMessageForEveryone error:', err);
      socket.emit('error', { message: 'Failed to delete message for everyone' });
    }
  });

  // 👀 Mark as Read
  socket.on('markGroupMessageAsRead', async ({ messageId }) => {
    try {
      const msg = await GroupMessage.findById(messageId);
      if (!msg) return socket.emit('error', { message: 'Message not found' });

      if (!msg.readBy.includes(socket.userId)) {
        msg.readBy.push(socket.userId);
        await msg.save();
      }

      socket.emit('messageRead', { messageId });
    } catch (err) {
      console.error('markGroupMessageAsRead error:', err);
      socket.emit('error', { message: 'Failed to mark as read' });
    }
  });

  // ✍️ Typing Indicator
  socket.on('typingGroup', ({ groupId, isTyping }) => {
    socket.to(groupId).emit('userTypingGroup', { userId: socket.userId, isTyping });
  });

};
