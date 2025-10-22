const mongoose = require("mongoose");

const influencerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  instaHandle: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/^\d{10}$/, "Please fill a valid phone number"],
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
    trim: true,
  },
  platforms: {
    type: [String],
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  insights: {
    type: {
      type: String,
      enum: ["micro", "nano", "macro", "mega"],
      default: "micro",
      required: true,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    posts:{
      type:Number,
      default:0
    },
    engagementRate: {
      type: Number,
      default: 0,
    },
    authenticity: {
      type: String,
      enum: ["real", "fake"],
    },    
    categories: {
      type: [String],
      default: [],
    },
    regions: {
      type: [String],
      default: [],
    },
    updatedAt:{
      type:Date,
      default:Date.now()
    }
  }
},{ timestamps: true });

const Influencer = mongoose.model("Influencer", influencerSchema);




module.exports = Influencer;

