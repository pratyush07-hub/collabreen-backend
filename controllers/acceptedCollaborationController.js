const { uploadOnCloudinary } = require("../utils/Cloudinary");
const AcceptedCollaboration = require("../models/AcceptedCollaboration");

const AppError = require("../utils/appError");

// Create when request is accepted
const createAcceptedCollaboration = async (req, res, next) => {
  try {
    const { senderId, receiverId, projectName } = req.body;

    if (!senderId || !receiverId || !projectName) {
      return next(new AppError("Missing required fields", 400));
    }

    const newCollab = await AcceptedCollaboration.create({
      sender: senderId,
      receiver: receiverId,
      projectName,
    });

    res.status(201).json({
      success: true,
      message: "Collaboration accepted successfully",
      collaboration: newCollab,
    });
  } catch (error) {
    console.error("Error creating accepted collaboration:", error);
    next(error);
  }
};

const getUserCollaborations = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    console.log("User ID:", userId);

    if (!userId) return next(new AppError('User not authenticated', 401));

    const collaborations = await AcceptedCollaboration.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'active' // optional filter
    })
      .populate('sender', 'name email profilePic')
      .populate('receiver', 'name email profilePic')
      .sort({ updatedAt: -1 });

    console.log("Collaborations fetched:", collaborations);

    res.status(200).json({ success: true, collaborations });
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    next(error);
  }
};


// File upload for both sender & receiver
const uploadCollaborationFile = async (req, res, next) => {
  try {
    const { collaborationId } = req.params;
    const userId = req.user.id;
    console.log("userid", userId);

    if (!req.file) return next(new AppError("No file uploaded", 400));

    const result = await uploadOnCloudinary(req.file.path);
    if (!result) return next(new AppError("Cloudinary upload failed", 500));

    const collaboration = await AcceptedCollaboration.findById(collaborationId);
    if (!collaboration) return next(new AppError("Collaboration not found", 404));

    const fileData = {
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      fileType: req.file.mimetype,
      uploadedBy: userId,
    };

    console.log("filedata: ", fileData)
    collaboration.files.push(fileData);
    await collaboration.save();

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: fileData,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    next(error);
  }
};

const getAcceptedCollaborationById = async (req, res, next) => {
  try {
    const { collaborationId } = req.params;

    const collaboration = await AcceptedCollaboration.findById(collaborationId)
      .populate('sender', 'name email profilePic')
      .populate('receiver', 'name email profilePic')
      .populate('files.uploadedBy', 'name email profilePic');

    if (!collaboration) {
      return next(new AppError("Collaboration not found", 404));
    }

    res.status(200).json({
      success: true,
      collaboration,
    });
  } catch (error) {
    console.error("Error fetching collaboration by ID:", error);
    next(error);
  }
};


// Get all files for a specific collaboration
const getCollaborationFiles = async (req, res, next) => {
  try {
    const { collaborationId } = req.params;
    const collaboration = await AcceptedCollaboration.findById(collaborationId)
      .populate("files.uploadedBy", "name email profilePic");

    if (!collaboration) return next(new AppError("Collaboration not found", 404));

    res.status(200).json({
      success: true,
      files: collaboration.files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    next(error);
  }
};

module.exports = {
  createAcceptedCollaboration,
  getUserCollaborations,
  uploadCollaborationFile,
  getCollaborationFiles,
  getAcceptedCollaborationById
};