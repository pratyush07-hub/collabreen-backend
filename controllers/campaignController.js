const Campaign = require("../models/campaign");
const campaignMetrics = require("../models/campaignMetrics");

async function handleCampaignRegister(req,res) {
    console.log(req.user)
    if(req.user.userRole!="brand"){
        return res.status(403).json({msg:"You can not register a campaign"})
    }
    const {campaignName, preferredContent,category,duration,ageGroup,targetRegion,budget,description} = req.body
    console.log(req.body)

    if(!campaignName || !preferredContent || !category || !duration || !ageGroup || !targetRegion|| !budget || !description){
        return res.status(400).json({msg:"All fields are required"})
    }
    try {
    const newCampaign = await Campaign.create({
        campaignName,
        preferredContent,
        category,
        duration,
        ageGroup,
        targetRegion,
        budget,
        description,
        brand:req.user.roleId

    })

    const newCampaignMetrics = await campaignMetrics.create({
        campaign:newCampaign._id,

    })

    if(!newCampaignMetrics){
        return res.status(500).json({msg:"Error registering campaign"})
    }

    newCampaign.metrics = newCampaignMetrics._id
    await newCampaign.save()
    return res.json({msg:"Registered Successfully"})    
    } catch (err) {
        console.error(err)
        return res.status(500).json({msg:"Error registering campaign"})
    }
}


async function handleGetCampaignById(req,res) {
    const {campaignId} = req.params
    try {
        const campaign = await Campaign.findById(campaignId).populate("brand")
        if(!campaign){
            return res.status(404).json({msg:"Cant find the campaign"})
        }
        return res.json(campaign) 
    } catch (err) {
        console.error(err)
        return res.status(500).json({msg:"Error getting campaign"})
    }
}


async function handleCampaignUpdate(req,res) {
    const campaignId = req.params
    const campaign = await Campaign.findByIdAndUpdate(campaignId,{...req.body},{new:true})

    return res.json(campaign)
}


async function handleCampaignDelete(req,res) {
    
 const campaignId = req.params
const campaign = await Campaign.findByIdAndDelete(campaignId)
return res.json({msg:"Deleted successfully",campaign})
}


async function handleGetCampaignInfluencers(req,res) {
    const {campaignId} = req.params
    try {
        const campaign = await Campaign.findById(campaignId)
        if(!campaign){
            return res.status(404).json({msg:"Cant find the campaign"})
        }
        const data={
            goal:campaign.goal,
            target_audience:campaign.ageGroup,
            preferred_genres:campaign.category,
            content_type_options:campaign.preferredContent,
            budget:campaign.budget,
        }

        //send data to analyze and generate the influencers 
        // const influencers =  await getInfluencers(data)
        const influencers =  {name:"abc"}
        if(!influencers){
            return res.json(404).json({msg:"No suitable influencers"})
        }
        return res.json(influencers) 
    } catch (err) {
        console.error(err)
        return res.status(500).json({msg:"Error getting influencers"})
    }
}

module.exports = {
    handleCampaignRegister,
    handleGetCampaignById,
    handleCampaignUpdate,
    handleCampaignDelete,
    handleGetCampaignInfluencers
}