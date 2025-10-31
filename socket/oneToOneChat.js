const Message = require("../models/Message");
const Chat = require("../models/Chat");

module.exports = (io, socket, connectedUsers) => {
  // Join a 1:1 chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat: ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat: ${chatId}`);
  });

  // Send 1:1 message
  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, content, messageType, audioUrl } = data;

      // 1️⃣ Validate chatId
      if (!chatId) return socket.emit("error", { message: "Chat ID missing" });

      // 2️⃣ Handle message content (optional for audio)
      const safeContent = messageType === "audio" ? "" : (content || "").trim();

      if (messageType !== "audio" && !safeContent)
        return socket.emit("error", { message: "Empty message content" });

      // 3️⃣ Validate chat and participant
      const chat = await Chat.findById(chatId);
      if (!chat) return socket.emit("error", { message: "Chat not found" });
      if (!chat.participants.includes(socket.userId))
        return socket.emit("error", { message: "Unauthorized" });

      // 4️⃣ Create message
      const newMessage = await Message.create({
        chat: chatId,
        sender: socket.userId,
        content: safeContent,
        messageType: messageType || "text",
        ...(audioUrl && { audioUrl }), // add audioUrl only if present
        readBy: [socket.userId],
      });

      await newMessage.populate("sender", "name profilePic");
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        updatedAt: Date.now(),
      });

      // 5️⃣ Emit to chat room
      io.to(chatId).emit("receiveMessage", newMessage);

      // 6️⃣ Notify other participants
      chat.participants
        .filter((p) => p.toString() !== socket.userId)
        .forEach((participantId) => {
          const sid = connectedUsers.get(participantId.toString());
          if (sid) {
            io.to(sid).emit("newMessageNotification", {
              chatId,
              message: newMessage,
              from: socket.user.name,
            });
          }
        });

      // 7️⃣ Confirm to sender
      socket.emit("messageSent", {
        success: true,
        messageId: newMessage._id,
      });

      console.log(
        `✅ Message (${messageType || "text"}) sent in chat ${chatId} by ${
          socket.userId
        }`
      );
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      socket.emit("error", {
        message: "Failed to send message",
        details: err.message,
      });
    }
  });

  // Typing indicator
  socket.on("typing", ({ chatId, isTyping }) => {
    socket.to(chatId).emit("userTyping", { userId: socket.userId, isTyping });
  });

  // Mark messages as read
  socket.on("markAsRead", async ({ chatId, messageId }) => {
    try {
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: socket.userId },
        });
      } else if (chatId) {
        await Message.updateMany(
          { chat: chatId, readBy: { $ne: socket.userId } },
          { $addToSet: { readBy: socket.userId } }
        );
      }
      socket
        .to(chatId)
        .emit("messageRead", { chatId, messageId, readBy: socket.userId });
    } catch (err) {
      console.error(err);
    }
  });
};
