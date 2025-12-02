const Volunteer = require("../models/Volunteer");

exports.joinNow = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      city,
      skills,
      availability,
      experience,
      portfolio,
      goals,
    } = req.body;

    // Basic validation
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full Name and Email are required",
      });
    }

    // Save to DB
    const volunteer = await Volunteer.create({
      fullName,
      email,
      phone,
      city,
      skills,
      availability,
      experience,
      portfolio,
      goals,
    });

    return res.status(201).json({
      success: true,
      message: "Volunteer form submitted successfully",
      volunteer,
    });
  } catch (error) {
    console.error("Volunteer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};
