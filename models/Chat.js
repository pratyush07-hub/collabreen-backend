const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
}, { timestamps: true });

// Index for efficient queries
chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);