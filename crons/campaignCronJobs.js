const cron = require("node-cron");
const campaignMetrics = require("../models/campaignMetrics"); 

// Runs every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running a task every day at midnight");
  handleUpdateInfluencerCampaignMetrics();
});

async function handleUpdateInfluencerCampaignMetrics() {
  // Getting the date of 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let metrics;
  try {
    // Fetch metrics that are  updated 7 days ago
    metrics = await campaignMetrics.find({
      updatedAt: { $lte: sevenDaysAgo },
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return; 
  }

  for (const metric of metrics) {
    // Get actual metrics
    const fetchedMetrics = await getCampaignMetrics(metric.campaign);
    if (!fetchedMetrics) {
      console.error(`No data returned for campaign ${metric._id}`);
      continue;
    }

    Object.assign(metric, {
      ...metric.toObject(), // spread to keep existing values
      ...fetchedMetrics, // spread fetched metrics
      updatedAt: Date.now(),
    });

    try {
      await metric.save();
      console.log(`Metrics updated for campaign ${metric._id}`);
    } catch (error) {
      console.error(`Error saving metrics for campaign ${metric._id}:`, error);
    }
  }
}
