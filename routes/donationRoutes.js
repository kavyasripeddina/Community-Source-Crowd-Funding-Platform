const express = require('express');
const router = express.Router();
const { createDonation, getCampaignDonations, getMyDonations } = require('../controllers/donationController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createDonation);                        // Public (guests can donate too)
router.get('/my', protect, getMyDonations);              // Auth required
router.get('/campaign/:id', getCampaignDonations);       // Public

module.exports = router;
