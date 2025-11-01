const GroupMessage = require("../models/groupMessage");
const { getIO } = require("../socket/socketHandler");

// 📩 Get all messages for a group
exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const messages = await GroupMessage.find({ groupId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    // 🧹 Filter out messages deleted for this user
    const visibleMessages = messages.filter(
      (msg) => !msg.deletedFor.includes(userId)
    );

    res.json({ success: true, data: visibleMessages });
  } catch (err) {
    console.error("❌ Error fetching group messages:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

// 💬 Send group message
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const senderId = req.user.id;

    const message = await GroupMessage.create({
      groupId,
      sender: senderId,
      content,
      readBy: [senderId],
    });

    await message.populate("sender", "name profilePic");

    // Emit to group via socket
    try {
      const io = getIO();
      io.to(groupId.toString()).emit("receiveGroupMessage", message);
    } catch (e) {
      console.log("⚠️ WebSocket not available, saved to DB only");
    }

    res.json({ success: true, data: message });
  } catch (err) {
    console.error("❌ Error sending group message:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to send message" });
  }
};

// 🗑️ Delete for me (only current user)
exports.deleteGroupMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await GroupMessage.findById(messageId);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({
      success: true,
      message: "Message deleted for you",
    });
  } catch (err) {
    console.error("❌ Error deleting message for me:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// 🚮 Delete for everyone (only sender)
exports.deleteGroupMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await GroupMessage.findById(messageId);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages for everyone",
      });
    }

    message.isDeletedForEveryone = true;
    message.content = "🚫 This message was deleted";
    await message.save();

    // 🔁 Notify all clients in group via WebSocket
    try {
      const io = getIO();
      io.to(message.groupId.toString()).emit("groupMessageDeleted", {
        messageId: message._id,
      });
    } catch (e) {
      console.log("⚠️ WebSocket not available for delete event");
    }

    res.json({
      success: true,
      message: "Message deleted for everyone",
    });
  } catch (err) {
    console.error("❌ Error deleting message for everyone:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
