const express = require("express");
const { checkAuth,checkInfluencer } = require("../middlewares/auth");
const {
  handleInfluencerVerification,
  handleInfluencerRegistration,
  handleInfluencerProfile,
  handleInfluencerUpdate,
  handleInfluencerDelete,
  handleDeleteVerification,
  handleInfluencerInsightsGeneration,
  handleInfluencerInsightsEdit,
  handleGetCampaign,
  handleGetRelatedCampaigns,
  handleRegisterCampaign,
  handleGetPastCampaigns,
  handleGetPastCampaignAnalytics,
  handleGetOngoingCampaigns,
  handleGetOngoingCampaignAnalytics
} = require("../controllers/influencerController");

const influencerRouter = express.Router();


//REGISTRATION
//signup and send otp to mail
influencerRouter.post("/register", checkAuth, handleInfluencerRegistration);
//verify otp 
influencerRouter.post("/verify", checkAuth, handleInfluencerVerification);
//generate insights
influencerRouter.post("/auto-generate",checkAuth,handleInfluencerInsightsGeneration);

//PROFILE
influencerRouter.get("/profile", checkAuth, handleInfluencerProfile);

//EDITING AND UPDATING THE INFUENCER DATA
//edit insights  (only categories and regions for now)
influencerRouter.patch("/edit-insights",checkAuth,handleInfluencerInsightsEdit);
//edit influncer profile details
influencerRouter.patch("/edit", checkAuth, handleInfluencerUpdate);

//DELETE
//sends otp
influencerRouter.delete("/delete", checkAuth, handleInfluencerDelete);
//verifies and deletes
influencerRouter.delete("/delete-account", checkAuth, handleDeleteVerification);

//DISCOVER
//search campaigns by name
influencerRouter.get("/search-campaigns", checkAuth, handleGetCampaign);
//Search Campaigns by filter
influencerRouter.get("/related-campaigns",checkAuth, handleGetRelatedCampaigns)

//REGISTER FOR CAMPAIGNS
influencerRouter.post("/campaign-register",checkAuth,handleRegisterCampaign)

//CAMPAIGNS
//PAST CAMPAIGNS
//get past campaigns
influencerRouter.get("/past-campaigns", checkAuth,handleGetPastCampaigns);
//get each campaign metrics and influencer analytics for that campaign
influencerRouter.get("/past-campaign-analytics/:campaignId", checkAuth,handleGetPastCampaignAnalytics);

//ONGOING CAMPAIGNS
//get ongoing campaigns
influencerRouter.get("/ongoing-campaigns", checkAuth,handleGetOngoingCampaigns);
//get each campaign metrics and influencer analytics
influencerRouter.get("/ongoing-campaign-analytics/:campaignId", checkAuth,handleGetOngoingCampaignAnalytics);

module.exports = influencerRouter;
