const Chat = require('../models/Chat');
const CollaborationRequest = require('../models/CollaborationRequest');
const CreatorProfile = require('../models/CreatorProfile');
const AppError = require('../utils/appError');

// Send collaboration request (for CollaborationModal)
exports.sendCollaborationRequest = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { chatId, title, description, proposedDate, location } = req.body;
        
         // Get chat and find receiver
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) return next(new AppError('Chat not found', 404));

        const receiver = chat.participants.find(
            (p) => p._id.toString() !== senderId
        );


        if (!receiver) return next(new AppError('Receiver not found', 404));
        const receiverId = receiver._id;
        console.log("receiverId: ", receiverId)

        // Check if receiver has complete profile
        const receiverProfile = await CreatorProfile.findOne({ user: receiverId, isProfileComplete: true });
        if (!receiverProfile) return next(new AppError('Receiver profile not complete', 400));

        const request = await CollaborationRequest.create({
            sender: senderId,
            receiver: receiverId,
            title,
            description,
            proposedDate,
            location,
        });

        res.status(201).json({
            success: true,
            data: request,
        });
    } catch (error) {
        next(error);
    }
};

// Update request status (accept/reject)
exports.updateCollaborationRequestStatus = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body; // 'accepted', 'rejected', etc.
        const userId = req.user.id;
        console.log('Logged-in user ID:', userId);

        const request = await CollaborationRequest.findById(requestId);
        console.log('Request fetched:', request);
        if (!request || request.receiver.toString() !== userId.toString()) {
            return next(new AppError('Unauthorized to update this request', 403));
        }

        console.log('Logged-in user:', userId);
console.log('Request receiver:', request.receiver.toString());

        const updated = await CollaborationRequest.findByIdAndUpdate(
            requestId,
            { status },
            { new: true }
        ).populate('sender receiver', 'name');

        res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};
exports.getUserCollaborationRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { type } = req.query; // 'sent' or 'received'
        let query = { status: "pending" };

        if (type === 'sent') {
            query.sender = userId;
        } else if (type === 'received') {
            query.receiver = userId;
        } else {
            query.$or = [{ sender: userId }, { receiver: userId }];
        }

        const requests = await CollaborationRequest.find(query)
            .populate('sender', 'name profilePic')
            .populate('receiver', 'name profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};


exports.deleteCollaborationRequest = async (req, res, next) => {
    res.send("deleteCollaborationRequest placeholder");
};