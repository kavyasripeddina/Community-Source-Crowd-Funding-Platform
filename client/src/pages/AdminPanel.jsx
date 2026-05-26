import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PageSpinner } from '../components/Spinner';
import { CheckCircle, XCircle, Star, Users, Briefcase, TrendingUp, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, campaignsRes, donationsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/campaigns?limit=1000'),
        api.get('/admin/donations?limit=1000'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data.data);
      setCampaigns(campaignsRes.data.data);
      setDonations(donationsRes.data.data);
      setUsersList(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/campaigns/${id}/status`, { status });
      setCampaigns(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      toast.success(`Campaign marked as ${status}`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDonationStatusChange = async (id, status) => {
    try {
      // Find the specific donation to get its current (possibly edited) amount
      const donationToUpdate = donations.find(d => d._id === id);
      const verifiedAmount = donationToUpdate.amount;

      const res = await api.patch(`/admin/donations/${id}/status`, { 
        status, 
        verifiedAmount: verifiedAmount
      });
      
      toast.success(res.data.message);
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update donation status');
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this donation record? This will also subtract the amount from the campaign total if it was verified.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/donations/${id}`);
      setDonations(prev => prev.filter(d => d._id !== id));
      toast.success('Donation record deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this campaign and ALL its donations?')) {
      return;
    }
    
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c._id !== id));
      toast.success('Campaign deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${id}`);
      setUsersList(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const updateLocalAmount = (id, newAmount) => {
    setDonations(prev => prev.map(d => d._id === id ? { ...d, amount: Number(newAmount) } : d));
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await api.patch(`/admin/campaigns/${id}/featured`);
      setCampaigns(prev => prev.map(c => c._id === id ? { ...c, featured: res.data.data.featured } : c));
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Failed to toggle featured status');
    }
  };

  const handleToggleVerify = async (id) => {
    try {
      const res = await api.patch(`/admin/campaigns/${id}/verify`);
      setCampaigns(prev => prev.map(c => c._id === id ? { ...c, isVerified: res.data.data.isVerified } : c));
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Failed to toggle verification status');
    }
  };

  const handleToggleNgoVerification = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/verify-ngo`);
      setUsersList(prev => prev.map(u => u._id === id ? { ...u, isVerifiedNgo: res.data.data.isVerifiedNgo } : u));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update NGO verification');
    }
  };

  if (loading || !stats) return <PageSpinner />;

  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Admin Dashboard</h1>
            <p className="text-slate-500">Manage the platform, verify campaigns, and view analytics.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
             <button 
               onClick={() => setActiveTab('campaigns')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'campaigns' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Campaigns
             </button>
             <button 
               onClick={() => setActiveTab('donations')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'donations' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Donations
             </button>
             <button 
               onClick={() => setActiveTab('users')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Users
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">All Campaigns</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Verified Funds</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">₹{stats.totalRaised.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'campaigns' && (
          /* Campaign Management Table */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">Campaign Management</h3>
              <span className="text-xs font-semibold text-slate-400 uppercase">Showing All ({campaigns.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4">Goal & Raised</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {campaigns.map(campaign => (
                    <tr key={campaign._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <a href={`/campaign/${campaign._id}`} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-primary-600 line-clamp-1">
                          {campaign.title}
                        </a>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{campaign.category}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-slate-900">{campaign.creator?.name}</p>
                        <p className="text-xs text-slate-500">{campaign.creator?.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">₹{campaign.goalAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1 border border-slate-200 px-1.5 py-0.5 rounded inline-block bg-slate-50">
                          ₹{campaign.raisedAmount.toLocaleString()} raised
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleToggleVerify(campaign._id)}
                            className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 cursor-pointer border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                              campaign.isVerified ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                            }`}
                          >
                            {campaign.isVerified ? 'Verified ✓' : 'Unverified ✗'}
                          </button>
                          {campaign.proofDocument ? (
                            <a href={`http://localhost:5000${campaign.proofDocument}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline text-center">
                              View Proof
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 text-center">No doc</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 cursor-pointer border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                            campaign.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                            campaign.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                            campaign.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                            'bg-slate-50 text-slate-700 ring-slate-600/20'
                          }`}
                          value={campaign.status}
                          onChange={(e) => handleStatusChange(campaign._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFeatured(campaign._id)}
                          title={campaign.featured ? "Unfeature" : "Feature on Homepage"}
                          className={`p-2 rounded-lg transition-colors ${
                            campaign.featured 
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={campaign.featured ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          title="Delete Campaign"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No campaigns found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          /* Donation Management Table */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">Donation Verification</h3>
              <span className="text-xs font-semibold text-slate-400 uppercase">Showing All ({donations.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-4">Donor Name</th>
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Amount (Editable)</th>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {donations.map(donation => (
                    <tr key={donation._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{donation.donorName}</p>
                        <p className="text-xs text-slate-500 truncate">{donation.donorEmail || 'No email'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-primary-600 line-clamp-1">{donation.campaign?.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-bold">₹</span>
                          <input 
                            type="number" 
                            className="w-24 px-2 py-1 rounded border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            value={donation.amount}
                            onChange={(e) => updateLocalAmount(donation._id, e.target.value)}
                          />
                          <button 
                            title="Save Amount" 
                            onClick={() => handleDonationStatusChange(donation._id, donation.paymentStatus)}
                            className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">Click icon to save edited amount</p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-700 select-all cursor-copy" title="Click to copy">
                          {donation.transactionId || 'NOT PROVIDED'}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 cursor-pointer border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset ${
                            donation.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                            donation.paymentStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                            'bg-red-50 text-red-700 ring-red-600/20'
                          }`}
                          value={donation.paymentStatus}
                          onChange={(e) => handleDonationStatusChange(donation._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed (Verify first!)</option>
                          <option value="failed">Failed/Fraud</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs text-center">
                        {new Date(donation.createdAt).toLocaleDateString()}<br/>
                        {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteDonation(donation._id)}
                          title="Delete Record"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-500">No donations recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Management Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">User Management</h3>
              <span className="text-xs font-semibold text-slate-400 uppercase">Showing All ({usersList.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Account Type</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {usersList.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{u.name}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs font-medium uppercase">{u.accountType}</p>
                        {u.accountType === 'ngo' && (
                           <div className="mt-1">
                             <p className="text-[10px] text-slate-500 font-mono">{u.ngoRegistrationNumber}</p>
                             <button
                               onClick={() => handleToggleNgoVerification(u._id)}
                               className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${u.isVerifiedNgo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                             >
                               {u.isVerifiedNgo ? 'NGO Verified' : 'Verify NGO'}
                             </button>
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete User"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
