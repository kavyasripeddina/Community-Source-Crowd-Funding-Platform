require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfund';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing old data...');
    await User.deleteMany();
    await Campaign.deleteMany();
    await Donation.deleteMany();

    console.log('Creating Admin User...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@hopebridge.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Creating Regular User...');
    const normalUser = await User.create({
      name: 'John Donor',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
    });

    console.log('Creating Sample Campaigns...');
    const now = new Date();
    
    const c1 = await Campaign.create({
      title: 'Help Sarah Beat Cancer',
      description: 'Sarah is a loving mother of two who was recently diagnosed with Stage 3 Breast Cancer. The medical bills are piling up, and we are reaching out for community support to help cover chemotherapy and surgery costs. Every dollar matters!',
      goalAmount: 50000,
      raisedAmount: 12500,
      image: 'https://images.unsplash.com/photo-1542887800-faca0261c9e1?q=80&w=800&auto=format&fit=crop',
      category: 'medical',
      creator: adminUser._id,
      deadline: new Date(now.setMonth(now.getMonth() + 2)), // 2 months from now
      status: 'approved',
      featured: true,
      donorCount: 34
    });

    const c2 = await Campaign.create({
      title: 'Emergency Flood Relief for Kerala',
      description: 'Devastating floods have displaced thousands of families in Kerala. We are raising urgent funds to provide clean water, food packets, and temporary shelter materials. Please stand with us in this time of crisis.',
      goalAmount: 100000,
      raisedAmount: 55000,
      image: 'https://images.unsplash.com/photo-1510007886401-4972e70c46e0?q=80&w=800&auto=format&fit=crop',
      category: 'emergency',
      creator: adminUser._id,
      deadline: new Date(new Date().setDate(now.getDate() + 15)),
      status: 'approved',
      featured: true,
      donorCount: 120
    });

    const c3 = await Campaign.create({
      title: 'Community Science Lab for Local School',
      description: 'Our local public school lacks basic science equipment. We want to build a modern science lab to inspire the next generation of scientists and engineers. Proceeds go directly to purchasing microscopes. Join us in making science accessible.',
      goalAmount: 10000,
      raisedAmount: 2300,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
      category: 'education',
      creator: normalUser._id,
      deadline: new Date(new Date().setMonth(now.getMonth() + 1)),
      status: 'approved',
      featured: false,
      donorCount: 15
    });

    console.log('Creating Sample Donations...');
    await Donation.create({
      user: normalUser._id,
      campaign: c1._id,
      amount: 1000,
      message: 'Praying for your quick recovery!',
      isAnonymous: false
    });

    await Donation.create({
      user: adminUser._id,
      campaign: c2._id,
      amount: 5000,
      message: 'Stay strong.',
      isAnonymous: false
    });

    console.log('✅ Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
