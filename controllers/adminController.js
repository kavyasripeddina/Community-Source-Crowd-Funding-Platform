const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Donation = require('../models/Donation');

// @desc  Get all campaigns (for admin, any status)
// @route GET /api/admin/campaigns
const getAllCampaignsAdmin = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = status && status !== 'all' ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [campaigns, total] = await Promise.all([
    Campaign.find(query).populate('creator', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
    Campaign.countDocuments(query),
  ]);
  res.json({
    success: true,
    data: campaigns,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc  Approve or reject a campaign
// @route PATCH /api/admin/campaigns/:id/status
const updateCampaignStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }
  const campaign = await Campaign.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('creator', 'name email');
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  res.json({ success: true, message: `Campaign ${status}`, data: campaign });
};

// @desc  Toggle featured status
// @route PATCH /api/admin/campaigns/:id/featured
const toggleFeatured = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  campaign.featured = !campaign.featured;
  await campaign.save();
  res.json({ success: true, message: `Campaign ${campaign.featured ? 'featured' : 'unfeatured'}`, data: campaign });
};

// @desc  Toggle verify status
// @route PATCH /api/admin/campaigns/:id/verify
const toggleVerifyStatus = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  campaign.isVerified = !campaign.isVerified;
  await campaign.save();
  res.json({ success: true, message: `Campaign ${campaign.isVerified ? 'verified' : 'unverified'}`, data: campaign });
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, data: users });
};

// @desc  Promote/demote user role
// @route PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: `User role updated to ${role}`, data: user });
};

// @desc  Toggle NGO verification
// @route PATCH /api/admin/users/:id/verify-ngo
const toggleNgoVerification = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.accountType !== 'ngo') {
    return res.status(400).json({ success: false, message: 'User is not marked as an NGO account' });
  }
  user.isVerifiedNgo = !user.isVerifiedNgo;
  await user.save();
  res.json({ success: true, message: `NGO ${user.isVerifiedNgo ? 'verified' : 'unverified'}`, data: user });
};

// @desc  Delete a user
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  // Optionally, we could clean up the user's donations or campaigns here.
  // But for simple "delete record", we just delete the user document.
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
};

// @desc  Get dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  const [
    totalUsers,
    totalCampaigns,
    pendingCampaigns,
    approvedCampaigns,
    rejectedCampaigns,
    totalDonations,
    raisedAgg,
  ] = await Promise.all([
    User.countDocuments(),
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: 'pending' }),
    Campaign.countDocuments({ status: 'approved' }),
    Campaign.countDocuments({ status: 'rejected' }),
    Donation.countDocuments(),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);
  res.json({
    success: true,
    data: {
      totalUsers,
      totalCampaigns,
      pendingCampaigns,
      approvedCampaigns,
      rejectedCampaigns,
      totalDonations,
      totalRaised: raisedAgg[0]?.total || 0,
    },
  });
};

// @desc  Get all donations (admin)
// @route GET /api/admin/donations
const getAllDonationsAdmin = async (req, res) => {
  const { status, campaignId, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const query = status && status !== 'all' ? { paymentStatus: status } : {};
  if (campaignId) query.campaign = campaignId;

  const [donations, total] = await Promise.all([
    Donation.find(query)
      .populate('campaign', 'title')
      .populate('donor', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Donation.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: donations,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
};

// @desc  Approve/Fail a donation (manual verification)
// @route PATCH /api/admin/donations/:id/status
const updateDonationStatus = async (req, res) => {
  const { status, verifiedAmount } = req.body;
  if (!['completed', 'failed', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

  const oldStatus = donation.paymentStatus;
  
  // Update amount if provided (regardless of oldStatus, but usually when moving to completed)
  if (verifiedAmount !== undefined && !isNaN(verifiedAmount) && Number(verifiedAmount) > 0) {
    // If it was already completed, we need to adjust the campaign stats first
    if (oldStatus === 'completed') {
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { raisedAmount: -donation.amount }
      });
      // Update donor total too
      if (donation.donor) {
        await User.findByIdAndUpdate(donation.donor, {
          $inc: { totalDonated: -donation.amount }
        });
      }
    }
    
    // Set the new amount
    donation.amount = Number(verifiedAmount);
    
    // If it's already completed or moving to completed, we need to add the new amount
    if (status === 'completed' || oldStatus === 'completed') {
       await Campaign.findByIdAndUpdate(donation.campaign, {
         $inc: { raisedAmount: donation.amount }
       });
       if (donation.donor) {
         await User.findByIdAndUpdate(donation.donor, {
           $inc: { totalDonated: donation.amount }
         });
       }
    }
  }

  // If status is actually changing from NOT completed to completed
  if (status === 'completed' && oldStatus !== 'completed') {
    // Increment donor count only if not previously completed
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { donorCount: 1 },
    });
    
    // If amount wasn't updated just now, we still need to add it to campaign (handled above usually, but for safety)
    if (verifiedAmount === undefined) {
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { raisedAmount: donation.amount },
      });
      if (donation.donor) {
        await User.findByIdAndUpdate(donation.donor, {
          $inc: { totalDonated: donation.amount },
        });
      }
    }
  } 
  
  // If moving FROM 'completed' to something else ('failed' or 'pending')
  else if (oldStatus === 'completed' && status !== 'completed') {
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { raisedAmount: -donation.amount, donorCount: -1 },
    });
    if (donation.donor) {
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { totalDonated: -donation.amount },
      });
    }
  }

  donation.paymentStatus = status;
  await donation.save();

  res.json({ success: true, message: `Donation updated successfully`, data: donation });
};

// @desc  Delete a donation (admin)
// @route DELETE /api/admin/donations/:id
const deleteDonation = async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

  // If the donation was completed, subtract from campaign totals before deleting
  if (donation.paymentStatus === 'completed') {
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { raisedAmount: -donation.amount, donorCount: -1 }
    });
    if (donation.donor) {
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { totalDonated: -donation.amount }
      });
    }
  }

  await donation.deleteOne();
  res.json({ success: true, message: 'Donation record deleted' });
};

module.exports = { 
  getAllCampaignsAdmin, 
  updateCampaignStatus, 
  toggleFeatured, 
  toggleVerifyStatus,
  getAllUsers, 
  updateUserRole,
  toggleNgoVerification,
  deleteUser, 
  getDashboardStats,
  getAllDonationsAdmin,
  updateDonationStatus,
  deleteDonation,
};
