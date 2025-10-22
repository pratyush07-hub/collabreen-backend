const mongoose = require("mongoose");


const campaignMetricsSchema = new mongoose.Schema({
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    totalReach: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    topPerformers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Influencer",
        default:null
      }
    ],
    updatedAt:{
      type:Date,
      default:Date.now()
    }
  });
  
  
  const campaignMetrics = mongoose.model('CampaignMetrics', campaignMetricsSchema);
  
  module.exports = campaignMetrics;
  