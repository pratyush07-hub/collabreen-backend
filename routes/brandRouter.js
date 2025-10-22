const express = require("express");
const { checkAuth,checkBrand } = require("../middlewares/auth");
const {
  handleBrandRegistration,
  handleBrandProfile,
  handleBrandDelete,
  handleBrandDeleteVerification,
  handleGetInfluencers,
  handleGetInfluencer,
  handleGetPastCampaigns,
  handleGetPastCampaignAnalytics,
} = require("../controllers/brandController");

const brandRouter = express.Router();

brandRouter.post("/register", checkAuth, handleBrandRegistration);

brandRouter.get("/profile", checkAuth, handleBrandProfile);


brandRouter.delete("/delete", checkAuth, handleBrandDelete);

brandRouter.delete("/delete-verify", checkAuth, handleBrandDeleteVerification);

//DISCOVER
//gives influencer based on search
brandRouter.get("/get-influencer", checkAuth, handleGetInfluencer);
//gives influencer based on filter
brandRouter.get("/get-influencers", checkAuth, handleGetInfluencers);


//CAMPAIGNS
//past campaigns
brandRouter.get("/past-campaigns", checkAuth, handleGetPastCampaigns);
//past campaign by id and its analytics
brandRouter.get("/past-campaign-analytics/:campaignId", checkAuth, handleGetPastCampaignAnalytics);

//ongoing campaigns
brandRouter.get("/ongoing-campaigns", checkAuth, handleGetPastCampaigns);
//ongoing campaign by id and its analytics
brandRouter.get("/ongoing-campaign-analytics/:campaignId", checkAuth, handleGetPastCampaignAnalytics);


module.exports = brandRouter;
