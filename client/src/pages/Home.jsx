import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import CampaignCard from '../components/CampaignCard';
import { Spinner } from '../components/Spinner';
import { ArrowRight, TrendingUp, Users, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, statsRes] = await Promise.all([
          api.get('/campaigns/featured'),
          api.get('/campaigns/stats')
        ]);
        setFeatured(featuredRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113565694-c28ce70c4959?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 font-display">
              Empower Hope. <br className="hidden sm:block" />
              <span className="text-primary-400">Change Lives Today.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10">
              Join our community of changemakers. Raise funds for medical emergencies, social causes, and individuals in need with zero hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/campaigns" className="btn-primary px-8 py-3.5 text-lg rounded-full">
                Explore Campaigns
              </Link>
              <Link to="/create-campaign" className="btn-outline border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white px-8 py-3.5 text-lg rounded-full">
                Start a Fundraiser
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
              <div>
                <p className="text-4xl font-bold text-slate-900 font-display mb-1">{stats.totalCampaigns}</p>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Campaigns</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900 font-display mb-1 text-primary-600">
                  ₹{stats.totalRaised.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Raised</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900 font-display mb-1">{stats.totalDonations}</p>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Donations</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900 font-display mb-1">{stats.totalUsers}</p>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Members</p>
              </div>
            </div>
            <div className="text-center mt-10">
              <span className="inline-block bg-green-50 text-green-600 border border-green-200 text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                Live Updates After Every Verified Payment
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Campaigns */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 font-display flex items-center gap-2">
                <TrendingUp className="text-primary-500 w-8 h-8" /> Feature Fundraisers
              </h2>
              <p className="text-slate-600 mt-2">Support these urgent causes that need your immediate attention.</p>
            </div>
            <Link to="/campaigns" className="hidden sm:flex text-primary-600 hover:text-primary-700 font-semibold items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Spinner />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map(campaign => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <HeartPulse className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No active campaigns</h3>
              <p className="text-slate-500 mb-6">Be the first to start a fundraiser and make a difference.</p>
              <Link to="/create-campaign" className="btn-primary">Start a Campaign</Link>
            </div>
          )}
          
          <div className="mt-10 sm:hidden text-center">
            <Link to="/campaigns" className="btn-outline w-full text-primary-600 border-primary-200 bg-primary-50 hover:bg-primary-100">
              View all campaigns <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-800">
          <h2 className="text-3xl font-bold mb-12 font-display">Why Trust HopeBridge?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Verified</h3>
              <p className="text-slate-600">Every campaign is verified by our team. Payments are safe and encrypted.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">0% Platform Fee</h3>
              <p className="text-slate-600">We don't charge a fee on your medical and emergency fundraisers. (Gateway fees apply).</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Backed</h3>
              <p className="text-slate-600">Join thousands of donors who have already helped change countless lives.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
