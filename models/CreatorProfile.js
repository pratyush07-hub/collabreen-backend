// // models/CreatorProfile.js (example)
// const mongoose = require('mongoose');

// const creatorProfileSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     bio: { type: String, required: true },
//     skills: [{ type: String }],
//     availability: { type: String, enum: ['full-time', 'part-time', 'weekends', 'project-based', 'unavailable'] },
//     location: { type: String, required: true },
//     instagram: { type: String },
//     twitter: { type: String },
//     youtube: { type: String },
//     hourlyRate: { type: Number, default: 0 },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     projectRate: { type: Number, default: 0 },
//     profilePicture: { type: String },
//     bannerImage: { type: String },
//     lookingFor: { type: String },
//     rating: { type: Number, default: 0 },
//     reviewCount: { type: Number, default: 0 },
//     isProfileComplete: { type: Boolean, default: false },
//     portfolio: [{
//         title: String,
//         description: String,
//         thumbnail: String
//     }],
//     stats: {
//         totalCollaboration: { type: Number, default: 0 },
//         completeProjects: { type: Number, default: 0 },
//         averageRating: { type: Number, default: 0 },
//         totalReviews: { type: Number, default: 0 }
//     },
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('CreatorProfile', creatorProfileSchema);

const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, required: true },
    skills: [{ type: String }],
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'weekends', 'project-based', 'unavailable'],
    },
    location: { type: String, required: true },
    hometown: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    age: { type: Number, min: 10, max: 100 },
    languages: [{ type: String }],

    instagram: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    portfolio: { type: String },

    hourlyRate: { type: Number, default: 0 },
    projectRate: { type: Number, default: 0 },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    profilePicture: { type: String },
    bannerImage: { type: String },
    lookingFor: { type: String },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },

    stats: {
      totalCollaboration: { type: Number, default: 0 },
      completeProjects: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CreatorProfile', creatorProfileSchema);
