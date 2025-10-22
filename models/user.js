const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
    trim: true,
  },
  why: {
    type: String,
    trim: true,
  },
  role:{
    type:String,
    default:"user",
    trim:true,
    enum:["user","influencer","brand","ADMIN"]
  },
  roleId:{
    type:String,
    trim:true
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  emailVerified: {
    type: Boolean,
    default: false,
    
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  profilePic: {
    type: String,
    required: true
  },
  joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
});

const USER = mongoose.model("User", userSchema);
module.exports = USER;
