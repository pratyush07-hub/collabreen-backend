const Brand = require("../models/brand");
const crypto = require("crypto");
const { sendOTP } = require("../utils/email");
const USER = require("../models/user");
const influencerCampaignHistory = require("../models/influencerCampaignHistory");
const Influencer = require("../models/influencer");
const jwt = require("jsonwebtoken");

async function handleBrandRegistration(req, res) {
  try {
    const { brandName, instaHandle, email, phoneNumber, country, message } =
      req.body;

    if (
      !phoneNumber ||
      !brandName ||
      !email ||
      !instaHandle ||
      !country ||
      !message
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const brand = await Brand.findOne({
      $or: [
        { email: email },
        { phoneNumber: phoneNumber },
        { instaHandle: instaHandle },
      ],
    });
    if (brand) {
      if (brand.email === email) {
        return res.status(400).json({ msg: "Email is already registered" });
      }
      if (brand.phoneNumber === phoneNumber) {
        return res
          .status(400)
          .json({ msg: "Phone number is already registered" });
      }
      if (brand.instaHandle === instaHandle) {
        return res
          .status(400)
          .json({ msg: "Instagram handle is already registered" });
      }
    }

    const newBrand = await Brand.create({
      brandName,
      instaHandle,
      email,
      phoneNumber,
      country,
      message,
      user: req.user.id,
    });

    const user = await USER.findOne({ _id: req.user.id });
    if (user.role == "influencer" || user.role == "ADMIN") {
      return res
        .status(400)
        .json({ msg: `Invalid request you are a ${user.role}` });
    }

    user.role = "brand";
    user.roleId = newBrand._id;
    await user.save();
    
    
    if (!newBrand) {
      return res.status(500).json({ msg: "Error signing up" });
    }

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
    return res.json({ msg: "Registered Successfully",token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error registering as Brand" });
  }
}

async function handleBrandProfile(req, res) {
  try {
    const brand = await Brand.findOne({
      user: req.user.id,
    }).populate({
      path: "user",
      select: "-password",
    });

    if (!brand) {
      return res.status(400).json({ msg: "Not registered as brand yet" });
    }

    return res.json({ brand });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error fetching brand profile" });
  }
}

async function handleBrandDelete(req, res) {
  try {
    const brand = await Brand.findOneAndUpdate({ user: req.user.id });

    if (!brand) {
      return res.status(404).json({ msg: "brand not found" });
    }
    const code = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    brand.otp = code;
    brand.otpExpiry = otpExpiry;
    await brand.save();

    const emailContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px; width: 400px; margin: auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <p style="font-size: 18px;">Use the following code to delete your brand:</p>
          <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${code}</div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `;

    await sendOTP("Delete Verification", brand.email, emailContent);
    return res.json({ msg: "otp sent to email for verification" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error deleting brand profile" });
  }
}

async function handleBrandDeleteVerification(req, res) {
  try {
    const { otp } = req.body;

    const brand = await Brand.findOne({ user: req.user.id }).select(
      "+otp +otpExpiry"
    );

    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    if (brand.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (brand.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    await Brand.deleteOne({ _id: brand._id });

    return res.json({ msg: "Brand profile deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ msg: "Error verifying OTP for profile deletion" });
  }
}



//DISCOVER
//search influencers
//By influencer name
async function handleGetInfluencer(req, res) {
  const { searchQuery } = req.body;
  
  if (!searchQuery) {
    return res.status(400).json({ msg: "Search is required" });
  }
  
  try {
    const influencer = await Influencer.find({
      name: { $regex: searchQuery, $options: "i" }
    });
    
    if (!influencer) {
      return res.status(404).json({ msg: "influencer not found" });
    }
    
    return res.json(influencer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error getting influencer" });
  }
}

//by filter
async function handleGetInfluencers(req, res) {
  const { platforms,gender,categories,region } = req.body;
  
  try {
    const influencers = await Influencer.find({
      gender: { $regex: gender, $options: "i" },
      platforms: { $in: platforms },  
      "insights.region": { $in: region.length ? region : [/.*/] },
      "insights.categories": { $in: categories.length ? categories : [/.*/] }
    });
    
    
    
    
    if (!influencers) {
      return res.status(404).json({ msg: "influencers not found" });
    }
    
    return res.json(influencers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error getting influencers" });
  }
}

//PAST CAMPAIGNS

//get campaigns
async function handleGetPastCampaigns(req,res) {
  const userId = req.user.id;
  try {

    //for now fetching brand for id later should change to user
    const brand= await Brand.findOne({ user: userId });
    if (!brand) {
      return res.status(404).json({ msg: "brand not found" });
    }
    
    const campaigns = await influencerCampaignHistory.find({
      status: "completed",
      brand: brand._id,
    });

    return res.json(campaigns);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error getting campaigns" });
  }
}

//get each campaign and analytics
async function handleGetPastCampaignAnalytics(req,res) {
  const userId = req.user.id;
  const { campaignId } = req.params;
  
  try {
    const brand = await Brand.findOne({ user: userId });
    if (!brand) {
      return res.status(404).json({ msg: "brand not found" });
    }
    
    const campaignAnalytics = await influencerCampaignHistory.find({
      campaign: campaignId,
      status: "completed",
      brand: brand._id,
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



//ONGOING CAMPAIGNS

//get campaigns
async function handleGetOngoingCampaigns(req,res) {
  const userId = req.user.id;
  try {

    //for now fetching brand for id later should change to user
    const brand= await Brand.findOne({ user: userId });
    if (!brand) {
      return res.status(404).json({ msg: "brand not found" });
    }
    
    const campaigns = await influencerCampaignHistory.find({
      status: "ongoing",
      brand: brand._id,
    });

    return res.json(campaigns);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error getting campaigns" });
  }
}

//get each campaign and analytics
async function handleGetOngoingCampaignAnalytics(req,res) {
  const userId = req.user.id;
  const { campaignId } = req.params;
  
  try {
    const brand = await Brand.findOne({ user: userId });
    if (!brand) {
      return res.status(404).json({ msg: "brand not found" });
    }
    
    const campaignAnalytics = await influencerCampaignHistory.find({
      campaign: campaignId,
      status: "completed",
      brand: brand._id,
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


module.exports = {
  handleBrandRegistration,
  handleBrandProfile,
  handleBrandDelete,
  handleBrandDeleteVerification,
  handleGetInfluencer,
  handleGetInfluencers,
  handleGetPastCampaigns,
  handleGetPastCampaignAnalytics,
  handleGetOngoingCampaigns,
  handleGetOngoingCampaignAnalytics
};
