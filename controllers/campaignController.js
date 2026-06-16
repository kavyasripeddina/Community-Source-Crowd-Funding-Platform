const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// @desc  Create a campaign
// @route POST /api/campaigns
const createCampaign = async (req, res) => {
  const { title, description, category, goalAmount, deadline, beneficiary, location, tags } = req.body;
  const image = req.files && req.files.image && req.files.image[0] ? `/uploads/${req.files.image[0].filename}` : '';
  const proofDocument = req.files && req.files.proofDocument && req.files.proofDocument[0] ? `/uploads/${req.files.proofDocument[0].filename}` : '';
  const campaign = await Campaign.create({
    title,
    description,
    category,
    goalAmount,
    deadline,
    beneficiary,
    location,
    image,
    proofDocument,
    creator: req.user._id,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
     status: 'approved',
  });
  res.status(201).json({ success: true, message: 'Campaign created and pending approval', data: campaign });
};

// @desc  Get all approved campaigns (with search, filter, pagination)
// @route GET /api/campaigns
const getCampaigns = async (req, res) => {
  const { search, category, status = 'approved', page = 1, limit = 9, sort = '-createdAt' } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category && category !== 'all') query.category = category;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { beneficiary: { $regex: search, $options: 'i' } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [campaigns, total] = await Promise.all([
    Campaign.find(query)
      .populate('creator', 'name avatar accountType isVerifiedNgo')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Campaign.countDocuments(query),
  ]);
  res.json({
    success: true,
    data: campaigns,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc  Get single campaign
// @route GET /api/campaigns/:id
const getCampaignById = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('creator', 'name avatar email bio accountType isVerifiedNgo');
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  const donations = await Donation.find({ campaign: campaign._id })
    .sort('-createdAt')
    .limit(10);
  res.json({ success: true, data: { ...campaign.toJSON(), recentDonations: donations } });
};

// @desc  Update campaign
// @route PUT /api/campaigns/:id
const updateCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this campaign' });
  }
  const { title, description, category, goalAmount, deadline, beneficiary, location, tags } = req.body;
  if (title) campaign.title = title;
  if (description) campaign.description = description;
  if (category) campaign.category = category;
  if (goalAmount) campaign.goalAmount = goalAmount;
  if (deadline) campaign.deadline = deadline;
  if (beneficiary) campaign.beneficiary = beneficiary;
  if (location) campaign.location = location;
  if (tags) campaign.tags = tags.split(',').map((t) => t.trim());
  if (req.files && req.files.image && req.files.image[0]) campaign.image = `/uploads/${req.files.image[0].filename}`;
  if (req.files && req.files.proofDocument && req.files.proofDocument[0]) campaign.proofDocument = `/uploads/${req.files.proofDocument[0].filename}`;
  // Reset to pending if edited by user (not admin)
  if (req.user.role !== 'admin') campaign.status = 'pending';
  const updated = await campaign.save();
  res.json({ success: true, message: 'Campaign updated', data: updated });
};

// @desc  Delete campaign
// @route DELETE /api/campaigns/:id
const deleteCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this campaign' });
  }
  await Donation.deleteMany({ campaign: campaign._id });
  await campaign.deleteOne();
  res.json({ success: true, message: 'Campaign deleted successfully' });
};

// @desc  Get campaigns by logged-in user
// @route GET /api/campaigns/my
const getMyCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ creator: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: campaigns });
};

// @desc  Get featured campaigns
// @route GET /api/campaigns/featured
const getFeaturedCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ status: 'approved', featured: true })
    .populate('creator', 'name avatar accountType isVerifiedNgo')
    .sort('-createdAt')
    .limit(6);
  res.json({ success: true, data: campaigns });
};

// @desc  Get platform stats
// @route GET /api/campaigns/stats
const getStats = async (req, res) => {
  const [totalCampaigns, totalDonations, totalRaised, totalUsers] = await Promise.all([
    Campaign.countDocuments({ status: { $in: ['approved', 'completed'] } }),
    Donation.countDocuments({ paymentStatus: 'completed' }),
    Campaign.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$raisedAmount' } } }
    ]),
    require('../models/User').countDocuments(),
  ]);
  res.json({
    success: true,
    data: {
      totalCampaigns,
      totalDonations,
      totalRaised: totalRaised[0]?.total || 0,
      totalUsers,
    },
  });
};

module.exports = { createCampaign, getCampaigns, getCampaignById, updateCampaign, deleteCampaign, getMyCampaigns, getFeaturedCampaigns, getStats };
