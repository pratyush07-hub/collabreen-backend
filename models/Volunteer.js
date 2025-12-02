const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    city: { type: String },
    skills: { type: String },
    availability: { type: String },
    experience: { type: String },
    portfolio: { type: String },
    goals: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", VolunteerSchema);
