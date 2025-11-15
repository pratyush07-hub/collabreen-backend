
const CreatorProfile = require('../models/CreatorProfile');
const mongoose = require('mongoose'); // Import mongoose
const User = mongoose.model('User'); // Access the User model globally
const AppError = require('../utils/appError');
const LikeRequest = require('../models/LikeRequest');
const Chat = require('../models/Chat');
const { uploadOnCloudinary } = require('../utils/Cloudinary.js');

// Get all creator profiles (for explore/filter)
// exports.getAllProfiles = async (req, res, next) => {
//     try {
//         const { skills, location, availability } = req.query; // For filtering
//         let query = { isProfileComplete: true };

//         if (skills) query.skills = { $in: skills.split(',') };
//         if (location) query.location = { $regex: location, $options: 'i' };
//         if (availability) query.availability = availability;

//         const profiles = await CreatorProfile.find(query)
//             .populate('user', 'name email profilePic')
//             .select('-__v');

//         res.status(200).json({
//             success: true,
//             count: profiles.length,
//             data: profiles,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// exports.getAllProfiles = async (req, res, next) => {
//   try {
//     // Fetch all completed profiles except current user
//     const profiles = await CreatorProfile.find({
//       isProfileComplete: true,
//       user: { $ne: req.user.id }
//     })
//       .populate('user', 'name profilePic title location bannerImage')
//       .select('-__v');

//       console.log('Fetched profiles:', profiles);

//     res.status(200).json({
//       success: true,
//       profiles
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// exports.getAllProfiles = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     console.log("Getting all profiles for user:", userId);

//     // Only exclude profiles that were already accepted with this user
//     const acceptedRequests = await LikeRequest.find({
//       $or: [{ from: userId }, { to: userId }],
//       status: "accepted",
//     });

//     const excludedUserIds = acceptedRequests.map(req =>
//       req.from.toString() === userId ? req.to.toString() : req.from.toString()
//     );

//     // Fetch profiles that are complete and not yet accepted
//     const profiles = await CreatorProfile.find({
//       isProfileComplete: true,
//       user: { $nin: [userId, ...excludedUserIds] },
//     })
//       .populate("user", "name profilePic title location bannerImage")
//       .select("-__v");

//     console.log("Filtered profiles to return:", profiles.length);

//     res.status(200).json({
//       success: true,
//       profiles,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getAllProfiles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("Getting all profiles for user:", userId);

    const profiles = await CreatorProfile.find({
      isProfileComplete: true,
      user: { $ne: userId },      // exclude self
      likedBy: { $ne: userId },   // exclude profiles already liked by this user
    })
      .populate("user", "name profilePic title location bannerImage")
      .select("-__v");

    console.log("Filtered profiles to return:", profiles.length);

    res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    next(error);
  }
};


exports.getProfile = async (req, res, next) => {
  try {
    const profile = await CreatorProfile.findOne({ user: req.params.userId })
      .populate('user', 'name profilePic title location bannerImage');

    if (!profile) return next(new AppError('Profile not found', 404));

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Get single profile
exports.getMyProfile = async (req, res, next) => {
    try {
        const profile = await CreatorProfile.findOne({ user: req.user.id })
            .populate('user', 'name email profilePic')
            .populate('likes', '_id user');
        if (!profile) return next(new AppError('Profile not found', 404));

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};



// Like another user
exports.likeProfile = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const profileUserId = req.params.userId;

    if (currentUserId === profileUserId)
      return res.status(400).json({ success: false, message: "Cannot like your own profile" });

    // Check if a pending like request already exists
    const existing = await LikeRequest.findOne({ from: currentUserId, to: profileUserId, status: "pending" });
    if (existing) return res.status(400).json({ success: false, message: "Like request already sent" });

    const likeRequest = await LikeRequest.create({ from: currentUserId, to: profileUserId });

    await CreatorProfile.findOneAndUpdate(
      { user: profileUserId },
      { $addToSet: { likedBy: currentUserId } } // $addToSet avoids duplicates
    );

    res.status(200).json({
      success: true,
      data: { isLiked: true, requestId: likeRequest._id }
    });
  } catch (error) {
    next(error);
  }
};

// Get pending like requests for current user
exports.getPendingRequests = async (req, res, next) => {
  try {
    console.log("fetching pending like requests for user:", req.user.id);
    const currentUserId = req.user.id;
    const requests = await LikeRequest.find({ to: currentUserId, status: "pending" })
      .populate("from", "name profilePic");

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Accept or reject a like request

exports.respondLikeRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'rejected'
    const requestId = req.params.requestId;
    console.log("Responding to like request:", requestId, "Action:", action);
    const request = await LikeRequest.findById(requestId);

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = action === 'accepted' ? 'accepted' : 'rejected';
    await request.save();

    // If accepted, check for mutual like and create chat
    if (action === "accepted") {
      // Add the accepter's ID to the request sender's likedBy array
      await CreatorProfile.findOneAndUpdate(
        { user: request.from },
        { $addToSet: { likedBy: request.to } } // 'to' is the accepter
      );

      // Now check if both sides have accepted each other
      const mutualLike = await LikeRequest.findOne({
        $or: [
          { from: request.from, to: request.to, status: "accepted" },
          { from: request.to, to: request.from, status: "accepted" },
        ],
      });

      if (mutualLike) {
        // Create chat if not exists
        let chat = await Chat.findOne({
          participants: { $all: [request.from, request.to] },
        });

        console.log("Mutual like found, ensuring chat exists between users.", chat);
        if (!chat) {
          chat = await Chat.create({
            participants: [request.from, request.to],
          });
        }
      }
    }

    res.json({ success: true, message: `Like request ${action} successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Setup new profile (initial creation)
// exports.setupProfile = async (req, res, next) => {
//     try {
//         const userId = req.user.id;
//         const existing = await CreatorProfile.findOne({ user: userId });
//         if (existing) return next(new AppError('Profile already exists. Use update endpoint.', 400));

//         const profileData = {
//             user: userId,
//             ...req.body,
//             isProfileComplete: true, // Mark complete on successful setup
//         };

//         const profile = await CreatorProfile.create(profileData);

//         // Optionally update User's profilePic if provided
//         if (req.body.profilePicture) {
//             await User.findByIdAndUpdate(userId, { profilePic: req.body.profilePicture });
//         }

//         res.status(201).json({
//             success: true,
//             data: profile,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// exports.setupProfile = async (req, res, next) => {
//     try {
//         console.log('=== SETUP PROFILE CALLED ===');
//         console.log('User ID:', req.user.id);
//         console.log('Request body:', req.body);

//         const userId = req.user.id;
//         const existing = await CreatorProfile.findOne({ user: userId });
//         if (existing) return next(new AppError('Profile already exists. Use update endpoint.', 400));

//         // Create profile with the actual form data
//         const profileData = {
//             user: userId,
//             bio: req.body.bio || 'No bio provided',
//             location: req.body.location || 'Location not specified',
//             skills: req.body.skills || [],
//             availability: req.body.availability || 'unavailable',
//             hourlyRate: req.body.hourlyRate || 0,
//             projectRate: req.body.projectRate || 0,
//             instagram: req.body.instagram || '',
//             twitter: req.body.twitter || '',
//             youtube: req.body.youtube || '',
//             profilePicture: req.body.profilePicture || '',
//             bannerImage: req.body.bannerImage || '',
//             isProfileComplete: true,
//         };

//         console.log('Profile data to be created:', profileData);

//         const profile = await CreatorProfile.create(profileData);

//         // Optionally update User's profilePic if provided
//         if (req.body.profilePicture) {
//             await User.findByIdAndUpdate(userId, { profilePic: req.body.profilePicture });
//         }

//         console.log('Profile created successfully:', profile._id);
//         res.status(201).json({
//             success: true,
//             data: profile,
//         });
//     } catch (error) {
//         console.error('Setup profile error:', error);
//         next(error);
//     }
// };
// exports.setupProfile = async (req, res, next) => {
//     try {
//         console.log('=== SETUP PROFILE CALLED ===');
//         console.log('User ID:', req.user.id);
//         console.log('Request body:', req.body);
//         console.log('Files:', req.files);

//         const userId = req.user.id;

//         // Parse skills
//         let skillsArray = [];
//         if (req.body.skills) {
//             if (Array.isArray(req.body.skills)) {
//                 skillsArray = req.body.skills;
//             } else if (typeof req.body.skills === 'string') {
//                 skillsArray = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
//             }
//         }

//         // Optional: convert file buffers to placeholder strings for now
//         // In production, upload to Cloudinary/S3 and store the returned URLs.
//         const profilePicturePath = req.files?.profilePicture?.[0]
//             ? req.files.profilePicture[0].originalname
//             : (req.body.profilePicture || '');
//         const bannerImagePath = req.files?.bannerImage?.[0]
//             ? req.files.bannerImage[0].originalname
//             : (req.body.bannerImage || '');

//         const profileData = {
//             user: userId,
//             bio: req.body.bio || 'No bio provided',
//             location: req.body.location || 'Location not specified',
//             skills: skillsArray,
//             availability: req.body.availability || 'unavailable',
//             hourlyRate: Number(req.body.hourlyRate) || 0,
//             projectRate: Number(req.body.projectRate) || 0,
//             instagram: req.body.instagram || '',
//             twitter: req.body.twitter || '',
//             youtube: req.body.youtube || '',
//             profilePicture: profilePicturePath,
//             bannerImage: bannerImagePath,
//             isProfileComplete: true,
//         };

//         console.log('Upsert profileData:', profileData);

//         // Upsert (update if exists, else create)
//         const profile = await CreatorProfile.findOneAndUpdate(
//             { user: userId },
//             { $set: profileData },
//             { new: true, upsert: true }
//         );

//         // Optionally sync user's profilePic
//         if (profilePicturePath) {
//             await User.findByIdAndUpdate(userId, { profilePic: profilePicturePath });
//         }

//         console.log('Profile saved:', profile._id);
//         res.status(201).json({ success: true, data: profile });
//     } catch (error) {
//         console.error('Setup profile error:', error);
//         next(error);
//     }
// };
// exports.setupProfile = async (req, res, next) => {
//     try {
//         console.log('Body fields:', req.body);
//         console.log('Uploaded files:', req.files);

//         const userId = req.user.id;

//         const profileData = {
//             user: userId,
//             ...req.body,
//             profilePicture: req.files?.profilePicture
//                 ? req.files.profilePicture[0].path
//                 : null,
//             bannerImage: req.files?.bannerImage
//                 ? req.files.bannerImage[0].path
//                 : null,
//             isProfileComplete: true,
//         };

//         const profile = await CreatorProfile.create(profileData);

//         res.status(201).json({ success: true, data: profile });
//     } catch (error) {
//         next(error);
//     }
// };


exports.setupProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("req",req.body)

    const {
      bio,
      skills,
      availability,
      location,
      hometown,
      gender,
      age,
      languages,
      instagram,
      linkedin,
      twitter,
      youtube,
      portfolio,
      hourlyRate,
      projectRate,
    } = req.body;

    // Upload files to Cloudinary if they exist

    console.log(req.files)
    const profilePictureUpload = req.files?.profilePicture
  ? await uploadOnCloudinary(req.files.profilePicture[0].path)
  : null;

const bannerImageUpload = req.files?.bannerImage
  ? await uploadOnCloudinary(req.files.bannerImage[0].path)
  : null;


      console.log(profilePictureUpload, bannerImageUpload)
    const profileData = {
      user: userId,
      bio,
      skills,
      availability,
      location,
      hometown,
      gender,
      age,
      languages,
      instagram,
      linkedin,
      twitter,
      youtube,
      portfolio,
      hourlyRate,
      projectRate,
      profilePicture: profilePictureUpload?.secure_url || null,
      bannerImage: bannerImageUpload?.secure_url || null,
      isProfileComplete: true,
    };

    console.log("profileData", profileData)

    const profile = await CreatorProfile.create(profileData);

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    console.error("Profile setup error:", error);
    next(error);
  }
};


// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    console.log("Body fields:", req.body);
    console.log("Uploaded files:", req.files);

    const userId = req.user.id;

    // Extract body data with fallbacks
    const {
      bio,
      skills,
      availability,
      location,
      hometown,
      gender,
      age,
      languages,
      instagram,
      linkedin,
      twitter,
      youtube,
      portfolio,
      hourlyRate,
      projectRate,
    } = req.body;

    // Upload images to Cloudinary if provided
    const profilePictureUpload = req.files?.profilePicture
      ? await uploadOnCloudinary(req.files.profilePicture[0].path)
      : null;

    const bannerImageUpload = req.files?.bannerImage
      ? await uploadOnCloudinary(req.files.bannerImage[0].path)
      : null;


    // Prepare data for update
    const updateData = {
      bio,
      skills:
        typeof skills === "string"
          ? skills.split(",").map((skill) => skill.trim())
          : skills,
      availability,
      location,
      hometown,
      gender,
      age,
      languages:
        typeof languages === "string"
          ? languages.split(",").map((lang) => lang.trim())
          : languages,
      instagram,
      linkedin,
      twitter,
      youtube,
      portfolio,
      hourlyRate,
      projectRate,
      isProfileComplete: true,
      rating: 0,
    };
    console.log("hello", profilePictureUpload, bannerImageUpload)

    // Update image fields only if uploaded
    if (profilePictureUpload) {
      updateData.profilePicture = profilePictureUpload.secure_url;
    }

    if (bannerImageUpload) {
      updateData.bannerImage = bannerImageUpload.secure_url;
    }

    // Update or create profile if it doesn’t exist
    const updatedProfile = await CreatorProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};
// creatorProfileController.js
// exports.likeProfile = async (req, res, next) => {
//     try {
//         const userId = req.user.id; // Authenticated user
//         const profileUserId = req.params.userId;

//         // Check if profile exists
//         const profile = await CreatorProfile.findOne({ user: profileUserId });
//         if (!profile) return next(new AppError('Profile not found', 404));

//         // Check if already liked (assuming a likes array in the schema)
//         if (profile.likes.includes(userId)) {
//             // Unlike: Remove user from likes
//             profile.likes = profile.likes.filter(id => id.toString() !== userId.toString());
//         } else {
//             // Like: Add user to likes
//             profile.likes.push(userId);
//         }

//         await profile.save();

//         res.status(200).json({
//             success: true,
//             data: { isLiked: profile.likes.includes(userId) },
//         });
//     } catch (error) {
//         next(error);
//     }
// };

exports.checkProfileStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await CreatorProfile.findOne({ user: userId });

        res.status(200).json({
            success: true,
            hasProfile: !!profile,
            isComplete: profile?.isProfileComplete || false,
            profile: profile || null
        });
    } catch (error) {
        next(error);
    }
};