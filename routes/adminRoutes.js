const express = require('express');
const router = express.Router();
const {
  getAllCampaignsAdmin, updateCampaignStatus, toggleFeatured, toggleVerifyStatus,
  getAllUsers, updateUserRole, toggleNgoVerification, deleteUser, getDashboardStats,
  getAllDonationsAdmin, updateDonationStatus, deleteDonation
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/campaigns', getAllCampaignsAdmin);
router.patch('/campaigns/:id/status', updateCampaignStatus);
router.patch('/campaigns/:id/featured', toggleFeatured);
router.patch('/campaigns/:id/verify', toggleVerifyStatus);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/verify-ngo', toggleNgoVerification);
router.delete('/users/:id', deleteUser);
router.get('/donations', getAllDonationsAdmin);
router.patch('/donations/:id/status', updateDonationStatus);
router.delete('/donations/:id', deleteDonation);

module.exports = router;
