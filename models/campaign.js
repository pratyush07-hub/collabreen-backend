const mongoose = require("mongoose");

const campaignSchema = new  mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
    trim: true,
  },
  preferredContent: {
    type: String,
    enum: ["posts", "reels", "both"],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  ageGroup: {
    type: String,
    required: true,
    trim: true,
  },
  targetRegion: {
    type: String,
    required: true,
    trim: true,
  },
  budget: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed", "paused"],
    default: "ongoing",
  },
  metrics: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CampaignMetrics",
    default:null
  },
});

const Campaign = mongoose.model("Campaign", campaignSchema);


module.exports = Campaign;
