// const mongoose = require("mongoose");

// const groupSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   category: String,
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   image: {
//     type: String,
//     default: "https://via.placeholder.com/150?text=Group+Image",
//   },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   createdAt: { type: Date, default: Date.now },
// });

// // Check if model already exists to avoid OverwriteModelError
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

// module.exports = Group;

const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: {
    type: String,
    default: "https://via.placeholder.com/150?text=Group+Image",
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  privacy: { 
    type: String, 
    enum: ["public", "private"], 
    default: "public" 
  },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

module.exports = Group;
