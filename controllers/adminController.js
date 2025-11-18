const CreatorProfile = require("../models/CreatorProfile");
const CollaborationRequest = require("../models/CollaborationRequest");
const Group = require("../models/group");
const LikeRequest = require("../models/LikeRequest");
const USER = require("../models/user");
const jwt = require("jsonwebtoken");


const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // FIXED ADMIN CREDENTIALS
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin123@gmail.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123@";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials",
    });
  }

  const token = jwt.sign(
    { role: "admin", email: ADMIN_EMAIL },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set token in HttpOnly cookie
  res.cookie("adminToken", token, {
    httpOnly: true, // prevents JS access
    secure: true, // HTTPS only in production
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Admin login successful",
  });
};

const adminLogout = (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({
    success: true,
    message: "Admin logged out successfully",
  });
};


const handleGetAllUsers = async (req, res) => {
  try {
    const users = await USER.find().select("-password");

    console.log("Fetched users:", users);
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const adminGetAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All groups fetched successfully",
      groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching groups",
    });
  }
};

const getAllCreators = async (req, res) => {
  try {
    const total = await CreatorProfile.countDocuments();

    return res.status(200).json({
      success: true,
      totalProfiles: total,
    });
  } catch (error) {
    console.error("Error fetching total creators:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching creator count",
    });
  }
};

const allMatches = async (req, res) => {
  try {
    const matches = await LikeRequest.find({ status: "accepted" })
      .populate("from", "name email profileImage")  
      .populate("to", "name email profileImage")    
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch matches",
    });
  }
};

const allCollaborations = async (req, res) => {
  try {
    const collaborations = await CollaborationRequest.find() 
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collaborations",
    });
  }
};


module.exports = {
  adminLogin,
  adminLogout,
  handleGetAllUsers,
  adminGetAllGroups,
  getAllCreators,
  allMatches,
  allCollaborations,
};
