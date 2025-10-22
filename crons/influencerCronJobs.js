const cron = require("node-cron");
const Influencer = require("../models/influencer");
const influencerCampaignHistory = require("../models/influencerCampaignHistory"); 

//runs every day at  midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running a task every day at midnight");
  handleUpdateInfluencerInsights();
  handleUpdateInfluencerCampaignAnalytics();
});


//update influencer insights
async function handleUpdateInfluencerInsights() {
  try {
    //geting the date of 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    //getting influencer whose insights got updated 30day ago
    const influencers = await Influencer.find({
      "insights.updatedAt": { $lte: thirtyDaysAgo },
    });
    //loops over each influencer and updates them
    for (const influencer of influencers) {
      try {
        //get actual analytics from the bot
        const fetchedData = await getInsightsDataFromBot(influencer.instaHandle);
        if (!fetchedData) {
          console.error(`No data returned for ${influencer.instaHandle}`);
          continue; 
        }
        //update insigts
        influencer.insights = {
          ...influencer.insights, //keeps old data if new fetched data is null
          type: fetchedData.type,
          followerCount: fetchedData.follower_count,
          followingCount: fetchedData.following_count,
          posts: fetchedData.posts,
          engagementRate: fetchedData.engagement_rate,
          updatedAt: Date.now(), // Ensure updatedAt is set here
        };

        await influencer.save();
        console.log(`Updated insights for ${influencer.instaHandle}`);
      } catch (err) {
        console.error(`Error processing ${influencer.instaHandle}:`, err);
      }
    }
  } catch (err) {
    console.error("Error in handleUpdateInfluencerInsights:", err);
  }
}

async function handleUpdateInfluencerCampaignAnalytics() {
  try {
    //geting the date of 7 days ago

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    //getting campaignHistory whose analytics got updated 7 days ago
    const campaigns = await influencerCampaignHistory.find({
      updatedAt: { $lte: sevenDaysAgo },
    });

    for (const campaign of campaigns) {
      try {
        const fetchedData = await getInsightsDataFromBot(campaign._id);
        if (!fetchedData) {
          console.error(`No data returned for campaign ${campaign._id}`);
          continue; 
        }

        campaign.influencerAnalytics = {
            ...campaign.influencerAnalytics, //keeps old data if new fetched data is null
          views: fetchedData.views,
          likes: fetchedData.likes,
          comments: fetchedData.comments,
          shares: fetchedData.shares,
          saves: fetchedData.saves,
          reach: fetchedData.reach,
          engagementRate: fetchedData.engagementRate,
        };
        campaign.updatedAt = Date.now();

        await campaign.save();
        console.log(`Updated analytics for campaign ${campaign._id}`);
      } catch (err) {
        console.error(`Error processing campaign ${campaign._id}:`, err);
      }
    }
  } catch (err) {
    console.error("Error in handleUpdateInfluencerCampaignAnalytics:", err);
  }
}
