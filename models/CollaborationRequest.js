const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending",
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    proposedDate: {
        type: Date,
    },
    location: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("CollaborationRequest", collaborationRequestSchema);