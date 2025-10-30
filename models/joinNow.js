const mongoose = require("mongoose");

const joinNowSchema = new mongoose.Schema({
  fullName:   { type: String, required: true },
  email:      { type: String, required: true, lowercase: true, trim: true },
  company:    { type: String },
  website:    { type: String },
  position:   { type: String },
  niche:      { type: String },
  phone:      { type: String },
  goals:      { type: String },
}, { timestamps: true });

// Prevent OverwriteModelError in dev
const JoinNow = mongoose.models.JoinNow || mongoose.model("JoinNow", joinNowSchema);

module.exports = JoinNow;
