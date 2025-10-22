const Influencer = require("../models/influencer");
const crypto = require("crypto");
const { sendOTP } = require("../utils/email");
const USER = require("../models/user")
const Campaign = require("../models/campaign");
const influencerCampaignHistory = require("../models/influencerCampaignHistory");
const jwt = require("jsonwebtoken");
const campaignMetrics = require("../models/campaignMetrics");
const GenerateInstaInsights = require("../utils/GenerateInstaInsights");

async function handleInfluencerRegistration(req, res) {
  try {
    const {name,instaHandle,email,phoneNumber,country,message,gender} = req.body;
    console.log("Req.body", req.body);
    const platforms =["instagram"]
    if (
      !phoneNumber || !name || !email || !instaHandle || !country || !message || !gender || !platforms){
      return res.status(400).json({ msg: "All fields are required" });
    }
  
    const existingInfluencer = await Influencer.findOne({
      $or: [
        { email },
        { phoneNumber },
        { instaHandle }
      ],
    });
    console.log("Existing Influencer:", existingInfluencer);
    if (existingInfluencer) {
      return res.status(400).json({
        msg: existingInfluencer.email === email ? "Email is already registered" :
             existingInfluencer.phoneNumber === phoneNumber ? "Phone number is already registered" :
             "Instagram handle is already registered",
      });
    }
    const code = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    
    const newInfluencer = await Influencer.create({
      name,
      instaHandle,
      email,
      phoneNumber,
      country,
      message,
      gender,
      platforms,
      user: req.user.id,
      otp:code,
      otpExpiry:otpExpiry
    });
    console.log("New Influencer created:", newInfluencer);

    if (!newInfluencer) {
      return res.status(500).json({ msg: "Error signing up" });
    }
    //Content for email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px; width: 400px; margin: auto;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 18px;">Use the following code to register as influencer:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${code}</div>
        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `;
    //sending email for verification
    try {
      await sendOTP("Your OTP Code", email, emailContent);
      return res.json({ msg: "Registered Successfully and Verification Email is Sent"  ,newInfluencer});
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({ msg: "Error sending OTP email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error registering as influencer" });
  }
}

async function handleInfluencerVerification(req, res) {
  const  otp  = req.body.otpCode;
 console.log(otp)
  if (!otp) {
    return res.status(400).json({ msg: "OTP is required" });
  }

  try {
    const userId = req.user.id;

    const influencer = await Influencer.findOne({ user: userId });
    if (!influencer) {
      return res.status(404).json({ msg: "User not found" });
    }
    //check validity
    const isValidOTP = influencer.otp === otp;
    const isExpired = influencer.otpExpiry < new Date();
    if (!isValidOTP) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    if (isExpired) {
      return res.status(400).json({ msg: "OTP has expired" });
    }
    //get user and update type and set otp to undefined
    const user = await USER.findById(req.user.id);
    if (user.role === "brand" || user.role === "ADMIN") {
      return res.status(400).json({ msg: `Invalid request, you are a ${user.role}` });
    }

    user.role = "influencer";
    user.roleId = influencer._id;
    influencer.emailVerified = true;
    influencer.otp = undefined;
    influencer.otpExpiry = undefined;

    // Save changes
    await influencer.save()
    await  user.save();

    const userDetails = {
      id: user._id,
      name: user.name,
      instaHandle: user.instaHandle,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userRole:user.role,
      roleId:user.roleId
    };
    const token = jwt.sign({ userDetails }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    return res.json({ msg: "Email verified successfully" ,token});
  } catch (err) {
    console.error("Error during OTP verification:", err);
    return res.status(500).json({ msg: "Error verifying email" });
  }
}
 
async function handleInfluencerInsightsGeneration(req, res) {
  try {
    // Get influencer data
    const influencerId = req.user.roleId;
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ msg: "Can't find the registered data" });
    }
    console.log(`Generating insights for influencer: ${influencer.instaHandle}`);
    try {
      const fetchedData = await GenerateInstaInsights(influencer.instaHandle);
      if (!fetchedData) {
        return res.status(500).json({
          msg: "Error fetching insights data",
          suggestion: "Please try again in a few minutes. Instagram may be rate limiting requests."
        });
      }
      // Map the correct field names from Python response
      influencer.insights = {
        categories: fetchedData.method1 ? [fetchedData.method1] : [],
        type: determineInfluencerType(fetchedData.followers || 0),
        followerCount: fetchedData.followers || 0,
        followingCount: fetchedData.following || 0,
        posts: fetchedData.posts || 0,
        engagementRate: fetchedData.engagementRate || 0,
        authenticity: fetchedData.accountType === "real" ? "real" : "fake",
        lastUpdated: new Date()
      };
      await influencer.save();
      console.log("Insights saved successfully");
      return res.json({
        msg: "Insights generated successfully",
        fetchedData,
        influencer: {
          instaHandle: influencer.instaHandle,
          insights: influencer.insights
        }
      });
    } catch (error) {
      console.error("Error during fetching insights:", error);
      // Provide specific error messages based on the error type
      if (error.message.includes("rate limiting") || error.message.includes("401 Unauthorized")) {
        return res.status(429).json({
          msg: "Instagram is currently rate limiting requests",
          error: "Please wait 10-15 minutes before trying again",
          retryAfter: 900 // 15 minutes in seconds
        });
      }
      if (error.message.includes("timeout")) {
        return res.status(504).json({
          msg: "Request timeout",
          error: "The request took too long to process. Please try again later."
        });
      }
      return res.status(500).json({
        msg: "Error during fetching insights",
        error: error.message,
        suggestion: "Check if the Instagram username is correct and publicly accessible"
      });
    }
  } catch (error) {
    console.error("Error generating influencer insights", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
}

// Helper function to determine influencer type based on followers
function determineInfluencerType(followers) {
  if (followers < 1000) return "nano";
  if (followers < 10000) return "micro";
  if (followers < 100000) return "mid";
  if (followers < 1000000) return "macro";
  return "mega";
}



async function handleInfluencerInsightsEdit(req, res) {
  try {
    const userId = req.user.id;
    const { categories, regions } = req.body;

    const influencer = await Influencer.findOne({ user: userId });

    if (!influencer) {
      return res.status(404).json({ msg: "Influencer data not found" });
    }

    // updating only these for now as other things should be generated by the bot for authenticity
    if (categories) influencer.insights.categories = categories;
    if (regions) influencer.insights.regions = regions;

    await influencer.save();

    return res.json({ msg: "Insights updated successfully",  influencer });
  } catch (error) {
    console.error("Error in handleInfluencerInsightsEdit:", error);
    return res.status(500).json({ msg: "Error updating insights" });
  }
}


async function handleInfluencerProfile(req, res) {
  try {
    const influencer = await Influencer.findOne({
      user: req.user.id,
    }).populate({
      path: "user",
      select: "-password",
    });

    if (!influencer) {
      return res.status(400).json({ msg: "Not registered as influencer yet" });
    }

    return res.json({ influencer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error fetching influencer profile" });
  }
}

async function handleInfluencerUpdate(req, res) {
  try {
    const {
      name,
      instaHandle,
      email,
      phoneNumber,
      country,
      message,
      creatorType,
      gender,
      platforms,
      category,
      regions,
    } = req.body;

    const updateFields = {
      ...(name && { name }),
      ...(instaHandle && { instaHandle }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(country && { country }),
      ...(message && { message }),
      ...(creatorType && { creatorType }),
      ...(gender && { gender }),
      ...(platforms && { platforms }),
      ...(category && { category }),
      ...(regions && { regions }),
    };

    const influencer = await Influencer.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!influencer) {
      return res.status(400).json({ msg: "Influencer not found" });
    }

    return res.json({ msg: "Profile updated successfully", influencer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error updating influencer profile" });
  }
}

async function handleInfluencerDelete(req, res) {
  try {
    const influencer = await Influencer.findOneAndUpdate({ user: req.user.id });

    if (!influencer) {
      return res.status(404).json({ msg: "Influencer not found" });
    }
    const code = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    influencer.otp = code;
    influencer.otpExpiry = otpExpiry;
    await influencer.save();

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px; width: 400px; margin: auto;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 18px;">Use the following code to register as influencer:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${code}</div>
        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `;

    await sendOTP("Delete Verification", influencer.email, emailContent);
    return res.json({ msg: "Influencer profile deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error deleting influencer profile" });
  }
}

async function handleDeleteVerification(req, res) {
  try {
    const { otp } = req.body;

    const influencer = await Influencer.findOne({ user: req.user.id }).select(
      "+otp +otpExpiry"
    );

    if (!influencer) {
      return res.status(404).json({ msg: "Influencer not found" });
    }

    if (influencer.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (influencer.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    await Influencer.deleteOne({ _id: influencer._id });

    return res.json({ msg: "Influencer profile deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ msg: "Error verifying OTP for profile deletion" });
  }
}

async function handleGetCampaign(req, res) {
  const { searchQuery } = req.body;
  
  if (!searchQuery) {
    return res.status(400).json({ msg: "Search is required" });
  }
  
  try {
    const campaign = await Campaign.find({
      campaignName: { $regex: searchQuery, $options: "i" }
    });
    
    
    return res.json(campaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error getting Campaign" });
  }
}


async function handleGetRelatedCampaigns(req, res) {
  const { duration,region, category } = req.body;

  if (!duration || !region || !category) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const campaigns = await Campaign.find({
      duration: duration,
      targetRegion: { $regex: region, $options: "i" },     
      category: { $regex: category, $options: "i" }   
    });

    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error getting campaigns" });
  }
}

async function handleRegisterCampaign(req, res) {
  try {
    const { campaignId, brandId } = req.body;
    const influencerId = req.user.roleId;

    if (!campaignId || !brandId || !influencerId) {
      return res.status(400).json({ msg: "Campaign ID, Brand ID, and Influencer ID are required." });
    }

    const newCampaign = await influencerCampaignHistory.create({
      influencer: influencerId,
      campaign: campaignId,
      brand: brandId,
    });

    return res.json({ msg: "Registered for campaign successfully", newCampaign });
  } catch (error) {
    console.error("Error registering for campaign:", error);
    return res.status(500).json({ msg: "An error occurred while registering for the campaign." });
  }
}

async function handleGetPastCampaigns(req,res) {
  const influencerId = req.user.roleId;
  try {

    
    const campaigns = await influencerCampaignHistory.find({
      status: "completed",
      influencer: influencerId,
    });

    return res.json(campaigns);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error getting campaigns" });
  }
}



async function handleGetPastCampaignAnalytics(req,res) {
  const influencerId = req.user.roleId;
  const { campaignId } = req.params;
  
  try { 
    const campaignAnalytics = await influencerCampaignHistory.findOne({
      campaign: campaignId,
      status: "completed",
      influencer: influencerId,
    })
    .populate("Campaign") 
    .populate("Brand");

    const campaignMetrics = await campaignMetrics.find({campaign:campaignId})


    if (!campaignAnalytics || !campaignMetrics) {
      return res.status(404).json({ msg: "Campaign analytics not found or campaign metrics not found"});
    }

    return res.json(campaignAnalytics,campaignMetrics);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error getting campaign analytics" });
  }
}


async function handleGetOngoingCampaigns(req,res) {
  const userId = req.user.roleId;
  try {

    
    const campaigns = await influencerCampaignHistory.find({
      status: "ongoing",
      influencer: influencerId,
    });

    return res.json(campaigns);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error getting campaigns" });
  }
}


async function handleGetOngoingCampaignAnalytics(req,res) {
  const influencerId = req.user.roleId;
  const { campaignId } = req.params;
  try {
    
    
    const campaignAnalytics = await influencerCampaignHistory.findOne({
      campaign: campaignId,
      status: "ongoing",
      influencer: influencerId,
    })
    .populate("campaign") 
    .populate("brand");
    // should add to influencer history itself later
    const metrics = await campaignMetrics.find({campaign:campaignId})

    if (!campaignAnalytics|| !metrics) {
      return res.status(404).json({ msg: "Campaign analytics not found" });
    }

    return res.json({campaignAnalytics,metrics});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error getting campaign analytics" });
  }
}

module.exports = {
  handleInfluencerRegistration,
  handleInfluencerVerification,
  handleInfluencerProfile,
  handleInfluencerDelete,
  handleDeleteVerification,
  handleInfluencerUpdate,
  handleInfluencerInsightsGeneration,
  handleInfluencerInsightsEdit,
  handleGetCampaign,
  handleGetRelatedCampaigns,
  handleRegisterCampaign,
  handleGetPastCampaigns,
  handleGetPastCampaignAnalytics,
  handleGetOngoingCampaigns,
  handleGetOngoingCampaignAnalytics

};
