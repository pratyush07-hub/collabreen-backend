const express = require("express");
const { joinNow } = require("../controllers/VolunteerController");
const router = express.Router();


// POST /api/volunteer/hiring
router.post("/hiring", joinNow);

module.exports = router;
