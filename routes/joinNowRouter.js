const express = require("express");
const { joinNow } = require("../controllers/joinNowController");


const router = express.Router();

router.post("/", joinNow);

module.exports = router;
