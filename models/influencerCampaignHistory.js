const mongoose = require("mongoose");

const influencerCampaignHistorySchema = new mongoose.Schema({
    influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  
    influencerAnalytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 }
  },
  
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

const influencerCampaignHistory = mongoose.model('InfluencerCampaignHistory', influencerCampaignHistorySchema);


module.exports = influencerCampaignHistory;
