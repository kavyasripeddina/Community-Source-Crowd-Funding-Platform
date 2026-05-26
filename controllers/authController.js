const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc  Register a new user
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, accountType, ngoRegistrationNumber } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
    });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const user = await User.create({ 
    name, 
    email, 
    password, 
    accountType: accountType || 'individual',
    ngoRegistrationNumber: accountType === 'ngo' ? ngoRegistrationNumber : ''
  });
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc  Login user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  const Donation = require('../models/Donation');
  
  // Calculate total donated across all transactions (including pending/processing for their personal dashboard)
  const d = await Donation.aggregate([
    { $match: { donor: user._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  user.totalDonated = d[0]?.total || 0;
  res.json({ success: true, data: user });
});

// @desc  Update profile
// @route PUT /api/auth/me
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.name = req.body.name || user.name;
  user.bio = req.body.bio || user.bio;
  
  if (req.body.password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({
    success: true,
    message: 'Profile updated',
    data: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      bio: updated.bio,
      avatar: updated.avatar,
      token: generateToken(updated._id),
    },
  });
});

module.exports = { registerUser, loginUser, getMe, updateProfile };
