const mongoose = require("mongoose");

const SupportMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true, // Only one thread per user
    required: true,
  },
  messages: [
    {
      message: { type: String, required: true },
      sentBy: { type: String, enum: ["user", "admin"], required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("SupportMessage", SupportMessageSchema);
