const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

// @desc  Create a donation
// @route POST /api/donations
const createDonation = async (req, res) => {
  const { campaignId, donorName, donorEmail, amount, message, anonymous, transactionId } = req.body;
  
  if (!campaignId || !amount) {
    return res.status(400).json({ success: false, message: 'Campaign and amount are required' });
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

  if (campaign.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Cannot donate to unapproved campaign' });
  }

  const donation = await Donation.create({
    campaign: campaignId,
    donor: req.user ? req.user._id : null,
    donorName: anonymous ? 'Anonymous' : (donorName || (req.user ? req.user.name : 'Anonymous')),
    donorEmail: donorEmail || (req.user ? req.user.email : ''),
    amount: Number(amount),
    message,
    anonymous: !!anonymous,
    transactionId: transactionId || '',
    paymentStatus: 'pending', // All static QR donations are pending until verified
  });

  // Note: We don't increment raisedAmount and donorCount until an admin verifies this donation.
  // This keeps the platform data accurate.
  
  res.status(201).json({ 
    success: true, 
    message: 'Donation recorded! It will appear on the platform after payment verification. 🙏', 
    data: donation 
  });
};

// @desc  Get donations for a campaign
// @route GET /api/donations/campaign/:id
const getCampaignDonations = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [donations, total] = await Promise.all([
    Donation.find({ campaign: req.params.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Donation.countDocuments({ campaign: req.params.id }),
  ]);
  res.json({
    success: true,
    data: donations,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc  Get my donations (logged in user)
// @route GET /api/donations/my
const getMyDonations = async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id })
    .populate('campaign', 'title image status')
    .sort('-createdAt');
  res.json({ success: true, data: donations });
};

module.exports = { createDonation, getCampaignDonations, getMyDonations };
