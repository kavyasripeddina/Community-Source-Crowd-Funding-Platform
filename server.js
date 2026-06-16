const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

dotenv.config();
connectDB();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
     'https://community-source-crowd-funding-plat.vercel.app'
  ],
  credentials: true,
}));s
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('<h1>CrowdFund API is running 🚀</h1><p>Use <b>/api/...</b> for API endpoints.</p>');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CrowdFund API is running 🚀', timestamp: new Date() });
});

// 🛠️ DATABASE DEBUG VIEW (Table View)
app.get('/api/data-debug', async (req, res) => {
  try {
    const users = await User.find({});
    const campaigns = await Campaign.find({}).populate('creator', 'name email');
    const donations = await Donation.find({}).populate('campaign', 'title');
    
    let html = `
      <html>
      <head>
        <title>Database Debug View</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f4f7f6; }
          h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background-color: #4CAF50; color: white; }
          tr:hover { background-color: #f1f1f1; }
          .summary { background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 1.1em; }
          .delete-btn { background-color: #ff4d4f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
          .delete-btn:hover { background-color: #ff7875; }
        </style>
      </head>
      <body>
        <h1>📦 Project Database: crowdfund</h1>
        
        <div class="summary">
          <b>Total Users:</b> ${users.length} | <b>Total Campaigns (Fundraisers):</b> ${campaigns.length} | <b>Total Donations:</b> ${donations.length}
        </div>

        <h2>👥 Users (Donors & Fundraisers)</h2>
        <table>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Created At</th><th>Action</th></tr>
          ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${new Date(u.createdAt).toLocaleString()}</td><td><button class="delete-btn" onclick="deleteRecord('User', '${u._id}')">Delete</button></td></tr>`).join('')}
        </table>

        <h2>📢 Campaigns (Fundraisers)</h2>
        <table>
          <tr><th>Title</th><th>Category</th><th>Goal (₹)</th><th>Raised (₹)</th><th>Creator</th><th>Status</th><th>Action</th></tr>
          ${campaigns.map(c => `<tr><td>${c.title}</td><td>${c.category}</td><td>${c.goalAmount}</td><td>${c.raisedAmount}</td><td>${c.creator?.name || 'N/A'}</td><td>${c.status}</td><td><button class="delete-btn" onclick="deleteRecord('Campaign', '${c._id}')">Delete</button></td></tr>`).join('')}
        </table>

        <h2>💰 Donations</h2>
        <table>
          <tr><th>Donor Name</th><th>Campaign</th><th>Amount (₹)</th><th>Status</th><th>Message</th><th>Date</th><th>Action</th></tr>
          ${donations.map(d => `<tr><td>${d.donorName}</td><td>${d.campaign?.title || 'N/A'}</td><td>${d.amount}</td><td>${d.paymentStatus}</td><td>${d.message}</td><td>${new Date(d.createdAt).toLocaleString()}</td><td><button class="delete-btn" onclick="deleteRecord('Donation', '${d._id}')">Delete</button></td></tr>`).join('')}
        </table>

        <script>
          async function deleteRecord(model, id) {
             if(confirm('Are you sure you want to permanently delete this ' + model + '?')) {
                const res = await fetch('/api/data-debug/delete', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ model, id })
                });
                if(res.ok) window.location.reload();
                else alert('Failed to delete.');
             }
          }
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).send(`<h1>Error Loading Data</h1><p>${error.message}</p>`);
  }
});

app.post('/api/data-debug/delete', async (req, res) => {
  try {
    const { model, id } = req.body;
    if (model === 'User') {
      await User.findByIdAndDelete(id);
    } else if (model === 'Campaign') {
      await Campaign.findByIdAndDelete(id);
      await Donation.deleteMany({ campaign: id });
    } else if (model === 'Donation') {
      const d = await Donation.findById(id);
      if (d) {
        if (d.paymentStatus === 'completed') {
           await Campaign.findByIdAndUpdate(d.campaign, { $inc: { raisedAmount: -d.amount, donorCount: -1 } });
        }
        await d.deleteOne();
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
