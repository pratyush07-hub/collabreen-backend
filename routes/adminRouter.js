const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { adminCheckAuth } = require("../middlewares/adminAuth");
const { handleGetAllUsers, adminGetAllGroups, allMatches, allCollaborations, getAllCreators, adminLogin, adminLogout } = require("../controllers/adminController");


const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
});


router.post("/login", adminLoginLimiter, adminLogin);
router.post("/logout", adminCheckAuth, adminLogout);
router.get("/allusers", adminCheckAuth, handleGetAllUsers);
router.get("/allgroups", adminCheckAuth, adminGetAllGroups);
router.get("/allcreators", adminCheckAuth, getAllCreators);
router.get("/allmatches", adminCheckAuth, allMatches);
router.get("/allcollaborations", adminCheckAuth, allCollaborations);

module.exports = router;

