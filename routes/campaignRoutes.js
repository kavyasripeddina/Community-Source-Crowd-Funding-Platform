const express = require('express');
const router = express.Router();
const {
  createCampaign, getCampaigns, getCampaignById,
  updateCampaign, deleteCampaign, getMyCampaigns,
  getFeaturedCampaigns, getStats,
} = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/stats', getStats);
router.get('/featured', getFeaturedCampaigns);
router.get('/my', protect, getMyCampaigns);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'proofDocument', maxCount: 1 }]), createCampaign);
router.put('/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'proofDocument', maxCount: 1 }]), updateCampaign);
router.delete('/:id', protect, deleteCampaign);

module.exports = router;
