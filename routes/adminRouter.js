const express = require("express");
const router = express.Router();
const { adminCheckAuth } = require("../middlewares/adminAuth");
const { handleGetAllUsers, adminGetAllGroups, allMatches, allCollaborations, getAllCreators, adminLogin, adminLogout } = require("../controllers/adminController");
// const { adminLoginLimiter } = require("../index.js");


router.post("/login", adminLogin);
router.post("/logout", adminCheckAuth, adminLogout);
router.get("/allusers", adminCheckAuth, handleGetAllUsers);
router.get("/allgroups", adminCheckAuth, adminGetAllGroups);
router.get("/allcreators", adminCheckAuth, getAllCreators);
router.get("/allmatches", adminCheckAuth, allMatches);
router.get("/allcollaborations", adminCheckAuth, allCollaborations);

module.exports = router;

