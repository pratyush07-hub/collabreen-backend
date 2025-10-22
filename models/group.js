const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: {
      type: String,
      default: "https://via.placeholder.com/150?text=Group+Image",
    },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});
const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
