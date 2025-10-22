const Meeting = require("../models/meeting")

// Create a new meeting
async function handleMeetingCreate(req, res) {
    try {
        const { meetingName, date, time, duration, platform, description } = req.body;

        if (!meetingName || !date || !time || !duration || !platform || !description) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const newMeeting = await Meeting.create({
            meetingName,
            host: req.user.id,
            date,
            time,
            duration,
            platform,
            description,
        });

        res.status(201).json({ message: "Meeting created successfully",newMeeting });
    } catch (error) {
        res.status(500).json({ error: "Failed to create meeting", details: error.message });
    }
}


// Get all meetings for the authenticated user
async function handleMeetingGetAll(req, res) {
    try {
        const meetings = await Meeting.find({ host: req.user.id });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve meetings", details: error.message });
    }
}

// Get a specific meeting by ID
async function handleMeetingGetById(req, res) {
    const { meetingId } = req.params;

    if (!meetingId) {
        return res.status(400).json({ error: "Meeting ID is required" });
    }

    try {
        const meeting = await Meeting.findOne({ _id: meetingId });

        if (!meeting) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        return res.json(meeting);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid Meeting ID format" });
        }
        res.status(500).json({ error: "Failed to retrieve meeting", details: error.message });
    }
}


// Edit an existing meeting
async function handleMeetingEdit(req, res) {
    try {
        const { meetingId } = req.params;
        const updateData = req.body;

        if (!meetingId) {
            return res.status(400).json({ error: "Meeting ID is required" });
        }

        const updatedMeeting = await Meeting.findOneAndUpdate(
            { _id: meetingId ,host: req.user.id},
            updateData,
            { new: true }
        );
        if (!updatedMeeting) {
            return res.status(404).json({ error: "Meeting not found" });
        }
        res.json({ message: "Meeting updated successfully", meeting: updatedMeeting });
    } catch (error) {
        res.status(500).json({ error: "Failed to update meeting", details: error.message });
    }
}

// Delete a meeting
async function handleMeetingDelete(req, res) {
    try {
        const { meetingId } = req.body;
        const deletedMeeting = await Meeting.findOneAndDelete({ _id: meetingId ,host: req.user.id});
        if (!deletedMeeting) {
            return res.status(404).json({ error: "Meeting not found" });
        }
        res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete meeting", details: error.message });
    }
}

// Get meetings by a specific date
async function handleMeetingGetByDate(req, res) {
    try {
        const { date } = req.params;
        const meetings = await Meeting.find({ host: req.user.id,date });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve meetings by date", details: error.message });
    }
}

// Search meetings by query
async function handleMeetingSearch(req, res) {
    try {
        const { query } = req.params;
        const regex = new RegExp(query, "i");
        const meetings = await Meeting.find({
            host: req.user.id,
            meetingName: regex,
        });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Failed to search meetings", details: error.message });
    }
}

// Get meetings by platform
async function handleMeetingGetByPlatform(req, res) {
    try {
        const { platform } = req.params;
        const meetings = await Meeting.find({ host: req.user.id, platform });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve meetings by platform", details: error.message });
    }
}

module.exports = {
    handleMeetingCreate,
    handleMeetingGetAll,
    handleMeetingGetById,
    handleMeetingEdit,
    handleMeetingDelete,
    handleMeetingGetByDate,
    handleMeetingSearch,
    handleMeetingGetByPlatform
};
