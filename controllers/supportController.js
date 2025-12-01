const USER = require("../models/user");
const SupportMessage = require("../models/SupportMessage");

// ------------------- USER -------------------

// Send user message
exports.sendUserMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    if (!message) return res.status(400).json({ msg: "Message required" });

    let thread = await SupportMessage.findOne({ user: userId });
    if (!thread) thread = new SupportMessage({ user: userId, messages: [] });

    thread.messages.push({ message, sentBy: "user" });
    await thread.save();

    res.status(200).json(thread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// Get user chat
exports.getUserChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const thread = await SupportMessage.findOne({ user: userId });

    if (!thread) return res.status(200).json({ messages: [] });

    res.status(200).json(thread.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// ------------------- ADMIN -------------------

// Admin replies to user
exports.adminReply = async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) return res.status(400).json({ msg: "UserId and message required" });

    let thread = await SupportMessage.findOne({ user: userId });
    if (!thread) thread = new SupportMessage({ user: userId, messages: [] });

    thread.messages.push({ message, sentBy: "admin" });
    await thread.save();

    res.status(201).json(thread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Admin gets all users who have sent messages
exports.getAllUsersWithChats = async (req, res) => {
  try {
    const users = await SupportMessage.find({})
      .sort({ updatedAt: -1 }) // latest threads first
      .populate("user", "name email"); // populate user info

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin gets specific user's chat
exports.getAdminChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const thread = await SupportMessage.findOne({ user: userId }).populate("user", "name email");

    if (!thread) return res.status(200).json({ messages: [] });

    res.json(thread.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
