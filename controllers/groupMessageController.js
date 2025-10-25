const GroupMessage = require("../models/groupMessage");

// Get all messages for a group
exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    const messages = await GroupMessage.find({ groupId })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: 1 }); // oldest messages first
    console.log("Fetched messages for group:", groupId, messages);
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Send message
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    console.log("Sending message to group:", groupId, "Content:", content);
    const message = await GroupMessage.create({
      group: groupId,
      sender: req.user.id,
      content,
      readBy: [req.user.id],
    });
    await message.populate("sender", "name profilePic");
    console.log("Message sent:", message);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
