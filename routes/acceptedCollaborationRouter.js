// routes/acceptedCollaborationRoutes.js
const express = require('express');
const router = express.Router();
const acceptedCollaborationController = require('../controllers/acceptedCollaborationController');
const { checkAuth } = require('../middlewares/auth');
const { upload } = require('../middlewares/multer'); // for file uploads

// Protect all routes
router.use(checkAuth);

// Create a new accepted collaboration
router.post('/', acceptedCollaborationController.createAcceptedCollaboration);

// Get all accepted collaborations for the logged-in user
router.get('/', acceptedCollaborationController.getUserCollaborations);

// Get a single accepted collaboration by ID
router.get('/:collaborationId/files', acceptedCollaborationController.getCollaborationFiles);

// Upload a file to a collaboration
router.post(
  '/:collaborationId/upload',
  upload.single('file'),
  acceptedCollaborationController.uploadCollaborationFile
);

module.exports = router;
