
const Group = require("../models/group.js");
const { uploadOnCloudinary } = require("../utils/Cloudinary.js");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, category, privacy } = req.body; // include category & privacy
    let imageUrl = "";

    // Upload image if provided
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult) imageUrl = uploadResult.secure_url;
    }

    const newGroup = await Group.create({
      name,
      description,
      category,
      privacy: privacy || "public", 
      image: imageUrl,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ success: false, message: "Failed to create group" });
  }
};

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("members", "name profilePic email")
      .populate("createdBy", "name profilePic email");
    console.log(groups);

    const formattedGroups = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      description: g.description,
      category: g.category,
      privacy: g.privacy,
      image: g.image,
      totalMembers: g.members.length,
      members: g.members,
      createdBy: g.createdBy,
    }));

    res.status(200).json({
      success: true,
      groups: formattedGroups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ success: false, message: "Failed to fetch groups" });
  }
};

// Get single group details
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Failed to fetch group details" });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Add user if not already a member
    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.status(200).json({ success: true, message: "Joined group", group });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Failed to join group" });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    // console.log("Group ID to leave:", groupId);

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // console.log("group :", group);
    // console.log("group members :", group.members);

    group.members = group.members.filter(
      (member) => member?.toString() !== req.user.id.toString()
    );

    // console.log("Updated members array:", group.members);

    await group.save();

    res.status(200).json({ success: true, message: "Left group", group });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Failed to leave group" });
  }
};
