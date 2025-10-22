const express = require("express");
const { checkAuth,checkBrand } = require("../middlewares/auth");
const {
  handleCampaignRegister,
  handleGetCampaignById,
  handleCampaignUpdate,
  handleCampaignDelete,
  handleGetCampaignInfluencers,
} = require("../controllers/campaignController");

const campaignRouter = express.Router();

campaignRouter.post("/register", checkAuth,handleCampaignRegister);

campaignRouter.get("/campaign/:campaignId", checkAuth, handleGetCampaignById);

campaignRouter.patch("/edit", checkAuth, handleCampaignUpdate);

campaignRouter.delete("/delete", checkAuth, handleCampaignDelete);

campaignRouter.get("/get-influencers/:campaignId",checkAuth,handleGetCampaignInfluencers);

module.exports = campaignRouter;
