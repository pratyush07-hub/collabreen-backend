const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: function () {
        return this.messageType === "text"; // only required for text messages
      },
    },
    creatorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreatorProfile",
        
    },
    audioUrl: { type: String }, 
      deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // "delete for me"
  isDeletedForEveryone: { type: Boolean, default: false },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    messageType: {
      type: String,
      enum: ["text", "image", "audio"],
      default: "text",
    },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);