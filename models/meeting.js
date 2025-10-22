const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
    meetingName: {
        type: String,
        required: true,
        trim: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String, 
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    platform: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
