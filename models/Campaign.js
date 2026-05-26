const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['medical', 'emergency', 'education', 'community', 'environment', 'other'],
      default: 'medical',
    },
    goalAmount: {
      type: Number,
      required: [true, 'Goal amount is required'],
      min: [1, 'Goal amount must be positive'],
    },
    raisedAmount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    proofDocument: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    beneficiary: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    donorCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Virtual for percentage raised
campaignSchema.virtual('percentageRaised').get(function () {
  return Math.min(Math.round((this.raisedAmount / this.goalAmount) * 100), 100);
});

// Virtual for days left
campaignSchema.virtual('daysLeft').get(function () {
  const now = new Date();
  const diff = this.deadline - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
