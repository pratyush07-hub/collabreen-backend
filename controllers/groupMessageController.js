const GroupMessage = require("../models/groupMessage");
const { getIO } = require("../socket/socketHandler");
const cloudinary = require("cloudinary").v2;

/* =====================================================
   ☁️ Cloudinary Config
===================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =====================================================
   📩 Get all messages for a group
===================================================== */
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
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

/* =====================================================
   💬 Send text message
===================================================== */
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const senderId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    const message = await GroupMessage.create({
      groupId,
      sender: senderId,
      content,
      type: "text",
      readBy: [senderId],
    });

    await message.populate("sender", "name profilePic");

    // 🔊 Emit via WebSocket
    try {
      const io = getIO();
      io.to(groupId.toString()).emit("receiveGroupMessage", message);
    } catch {
      console.log("⚠️ WebSocket not available, saved to DB only");
    }

    res.json({ success: true, data: message });
  } catch (err) {
    console.error("❌ Error sending group message:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

/* =====================================================
   🎙️ Send audio message (Cloudinary Upload)
===================================================== */
exports.sendGroupAudioMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const senderId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file uploaded" });
    }


    // ✅ Upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "video" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // console.log("☁️ Cloudinary Upload Complete:", cloudinaryResult.secure_url);

    const message = await GroupMessage.create({
      groupId,
      sender: senderId,
      audioUrl: cloudinaryResult.secure_url,
      type: "audio",
      readBy: [senderId],
    });

    await message.populate("sender", "name profilePic");

    // 🔊 Emit to group members
    try {
      const io = getIO();
      io.to(groupId.toString()).emit("receiveGroupAudioMessage", message);
    } catch {
      console.log("⚠️ WebSocket not available for audio message");
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error("❌ Error sending group audio message:", err);
    res.status(500).json({ success: false, message: "Failed to send audio message" });
  }
};

/* =====================================================
   🗑️ Delete message for me
===================================================== */
exports.deleteGroupMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await GroupMessage.findById(messageId);
    if (!message)
      return res.status(404).json({ success: false, message: "Message not found" });

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({ success: true, message: "Message deleted for you" });
  } catch (err) {
    console.error("❌ Error deleting message for me:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* =====================================================
   🚮 Delete message for everyone
===================================================== */
exports.deleteGroupMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await GroupMessage.findById(messageId);
    if (!message)
      return res.status(404).json({ success: false, message: "Message not found" });

    // Only sender can delete for everyone
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages for everyone",
      });
    }

    message.isDeletedForEveryone = true;
    message.content = "🚫 This message was deleted";
    message.audioUrl = null;
    await message.save();

    // 🔁 Notify all members
    try {
      const io = getIO();
      io.to(message.groupId.toString()).emit("groupMessageDeleted", {
        messageId: message._id,
      });
    } catch {
      console.log("⚠️ WebSocket not available for delete event");
    }

    res.json({ success: true, message: "Message deleted for everyone" });
  } catch (err) {
    console.error("❌ Error deleting message for everyone:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
