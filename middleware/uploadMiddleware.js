const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: 'crowdfund',
      resource_type: 'auto',
      allowed_formats: isPdf
        ? ['pdf']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      public_id: `campaign-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;