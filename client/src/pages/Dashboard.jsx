import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CampaignCard from '../components/CampaignCard';
import { PageSpinner, Spinner } from '../components/Spinner';
import { User, CreditCard, Activity, Settings, Edit, Trash2, Heart } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [campaignsRes, donationsRes] = await Promise.all([
          api.get('/campaigns/my'),
          api.get('/donations/my')
        ]);
        setMyCampaigns(campaignsRes.data.data);
        setMyDonations(donationsRes.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign? All donation records will also be removed.')) {
      try {
        await api.delete(`/campaigns/${id}`);
        setMyCampaigns(prev => prev.filter(c => c._id !== id));
        toast.success('Campaign deleted successfully');
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-4xl font-bold font-display flex-shrink-0 shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 font-display">{user.name}</h1>
            <p className="text-slate-500 mt-1">{user.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium">
              <span className="text-slate-500">Total Donated:</span>
              <span className="text-primary-600 font-bold">₹{myDonations.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
            </div>
          </div>
          {user.role === 'admin' && (
            <div className="flex-shrink-0">
              <Link to="/admin" className="btn-primary">Go to Admin Panel</Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'campaigns' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Activity className="w-5 h-5" /> My Fundraisers ({myCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'donations' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CreditCard className="w-5 h-5" /> Donation History ({myDonations.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-transparent">
          
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Your Campaigns</h2>
                <Link to="/create-campaign" className="btn-primary text-sm py-1.5">Start New</Link>
              </div>

              {myCampaigns.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 text-center">
                  <Activity className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">No campaigns yet</h3>
                  <p className="mt-1 text-slate-500 mb-6">Create a fundraiser to start raising money for your cause.</p>
                  <Link to="/create-campaign" className="btn-primary">Start a Campaign</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCampaigns.map(campaign => (
                    <div key={campaign._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <Link to={`/campaign/${campaign._id}`} className="block h-48 overflow-hidden">
                        <img 
                          src={`http://localhost:5000${campaign.image}`} 
                          alt="" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div className="p-5 flex-grow flex flex-col">
                        <Link to={`/campaign/${campaign._id}`} className="text-lg font-bold text-slate-900 hover:text-primary-600 line-clamp-1 mb-2">
                          {campaign.title}
                        </Link>
                        <div className="mt-2 mb-4 text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Raised</span>
                            <span className="font-semibold text-primary-600">₹{campaign.raisedAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Goal</span>
                            <span className="font-semibold text-slate-900">₹{campaign.goalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between gap-2">
                          <Link to={`/edit-campaign/${campaign._id}`} className="flex-1 btn-outline py-2 text-sm justify-center gap-1.5 focus:ring-0">
                            <Edit className="w-4 h-4"/> Edit
                          </Link>
                          <button onClick={() => handleDeleteCampaign(campaign._id)} className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 focus:outline-none transition-colors text-sm flex items-center justify-center">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Your Contributions</h2>
              
              {myDonations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">No donations yet</h3>
                  <p className="mt-1 text-slate-500 mb-6">Support a cause and your contribution history will appear here.</p>
                  <Link to="/campaigns" className="btn-primary">Explore Campaigns</Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <ul className="divide-y divide-slate-100">
                    {myDonations.map(donation => (
                      <li key={donation._id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                              <Heart className="w-6 h-6" fill="currentColor"/>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {donation.campaign?.title || 'Deleted Campaign'}
                              </p>
                              <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                <span>{format(new Date(donation.createdAt), 'PPP')}</span>
                                {donation.anonymous && <span className="px-2 py-0.5 bg-slate-200 rounded text-xs">Anonymous</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right ml-16 sm:ml-0">
                            <p className="text-xl font-bold text-slate-700">+ ₹{donation.amount.toLocaleString()}</p>
                            {donation.paymentStatus === 'pending' ? (
                               <p className="text-xs text-yellow-600 font-medium tracking-wide uppercase mt-1 px-2 py-0.5 bg-yellow-50 rounded-full inline-block border border-yellow-200">Pending</p>
                            ) : donation.paymentStatus === 'completed' ? (
                               <p className="text-xs text-green-600 font-medium tracking-wide uppercase mt-1 px-2 py-0.5 bg-green-50 rounded-full inline-block border border-green-200">Verified</p>
                            ) : (
                               <p className="text-xs text-red-600 font-medium tracking-wide uppercase mt-1 px-2 py-0.5 bg-red-50 rounded-full inline-block border border-red-200">{donation.paymentStatus}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
