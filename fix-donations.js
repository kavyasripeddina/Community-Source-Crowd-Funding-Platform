const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfund');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const User = require('./models/User');
const Donation = require('./models/Donation');

const fixDonations = async () => {
  await connectDB();

  console.log('Finding orphaned donations...');
  const donations = await Donation.find({ donor: null });
  console.log(`Found ${donations.length} orphaned donations. Fixing them...`);

  let count = 0;
  for (const donation of donations) {
    if (donation.donorEmail) {
      // Find user by email
      const user = await User.findOne({ email: donation.donorEmail });
      if (user) {
        donation.donor = user._id;
        await donation.save();
        console.log(`Fixed donation for ${user.name} (${user.email})`);
        count++;
      }
    } else if (donation.donorName) {
      // Very crude fallback by exact name match if email is somehow missing
      const user = await User.findOne({ name: donation.donorName });
      if (user) {
        donation.donor = user._id;
        await donation.save();
        console.log(`Fixed donation for ${user.name} via Name Match`);
        count++;
      }
    }
  }

  console.log(`Successfully fixed ${count} orphaned donations!`);
  process.exit();
};

fixDonations();
