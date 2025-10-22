// const express = require('express');
// const router = express.Router();
// const auth = require('../middlewares/auth');
// const profileCheck = require('../middlewares/profileCheck');
// const collaborationController = require('../controllers/collaborationController');

// router.use(auth);
// router.use(profileCheck);

// router.post('/', collaborationController.sendRequest);
// router.get('/', collaborationController.getRequests);
// router.put('/:requestId/status', collaborationController.updateRequestStatus);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/auth');
const collaborationController = require('../controllers/collaborationController');

// All collaboration routes protected by authentication
router.use(checkAuth);

// Send a new collaboration request
router.post('/', collaborationController.sendCollaborationRequest);

// Get all collaboration requests for the authenticated user (sent and received)
router.get('/', collaborationController.getUserCollaborationRequests);

// Get a single collaboration request by ID
// router.get('/:requestId', collaborationController.getCollaborationRequest);

// Update the status of a collaboration request (e.g., accept, reject)
router.put('/:requestId/status', collaborationController.updateCollaborationRequestStatus);

// Delete a collaboration request
router.delete('/:requestId', collaborationController.deleteCollaborationRequest);

module.exports = router;
