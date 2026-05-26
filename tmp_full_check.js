const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

const checkFullDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`📡 Checking database: ${mongoose.connection.db.databaseName}`);
    
    const users = await User.countDocuments();
    const campaignsBase = await Campaign.countDocuments();
    const donations = await Donation.countDocuments();
    
    console.log(`\n📊 DATABASE SUMMARY:`);
    console.log(`- Users: ${users}`);
    console.log(`- Campaigns: ${campaignsBase}`);
    console.log(`- Donations: ${donations}`);
    
    if (campaignsBase > 0) {
        console.log(`\n📋 LATEST 2 CAMPAIGNS:`);
        const latestC = await Campaign.find().sort({createdAt: -1}).limit(2).populate('creator', 'name');
        console.log(JSON.stringify(latestC, null, 2));
    }
    
    if (donations > 0) {
        console.log(`\n💰 LATEST 2 DONATIONS:`);
        const latestD = await Donation.find().sort({createdAt: -1}).limit(2);
        console.log(JSON.stringify(latestD, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkFullDB();
