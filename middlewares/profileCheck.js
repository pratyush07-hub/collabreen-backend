const CreatorProfile = require('../models/CreatorProfile');
const AppError = require('../utils/appError'); // Assume you have this for errors

const profileCheck = async (req, res, next) => {
    try {
        const userId = req.user.id; // From auth middleware
        const profile = await CreatorProfile.findOne({ user: userId });

        if (!profile || !profile.isProfileComplete) {
            return next(new AppError('Profile setup required before accessing this feature', 403));
        }
        req.profile = profile; // Attach for use in controllers
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = profileCheck;