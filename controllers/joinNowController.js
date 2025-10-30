const JoinNow = require("../models/joinNow");

exports.joinNow = async (req, res) => {
  try {
    const {
      email,
      company,
      website,
      position,
      niche,
      phone,
      goals,
    } = req.body;

    
    const sanitize = (str) => str?.trim();
    const fullName = sanitize(req.body.fullName);
    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }
    const existing = await JoinNow.findOne({ email });
if (existing) {
  return res.status(400).json({ success: false, message: "You have already joined the community." });
}


    const joined = await JoinNow.create({
      fullName,
      email,
      company,
      website,
      position,
      niche,
      phone,
      goals,
    });

    res.status(201).json({
      success: true,
      message: "User Joined Successfully",
      joined
    });
  } catch (error) {
    console.error("Error creating joinNow record:", error); 
    res.status(500).json({
      success: false,
      message: "Failed to join. Please try again later." 
    });
  }
};
