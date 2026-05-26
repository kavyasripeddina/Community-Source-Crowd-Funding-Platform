import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PageSpinner, Spinner } from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { MapPin, User, Calendar, Tag, ShieldCheck, HeartPulse } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Donation form state
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [donationStep, setDonationStep] = useState(1); // 1: Amount/Details, 2: Payment/QR

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await api.get(`/campaigns/${id}`);
        setCampaign(res.data.data);
        setRecentDonations(res.data.data.recentDonations || []);
      } catch (error) {
        toast.error('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const proceedToPayment = (e) => {
    e.preventDefault();
    const finalAmount = amount === 'custom' ? customAmount : amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      return toast.error('Please select or enter a valid amount');
    }
    if (!user && !donorName) {
      return toast.error('Please enter your name');
    }
    setDonationStep(2); // Move to QR scan step
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    const finalAmount = amount === 'custom' ? customAmount : amount;

    if (!transactionId) {
      return toast.error('Please enter your UPI Transaction/Reference ID');
    }

    try {
      setDonating(true);
      const payload = {
        campaignId: id,
        amount: Number(finalAmount),
        message,
        anonymous,
        transactionId,
        ...(user ? { donorName: user.name, donorEmail: user.email } : { donorName, donorEmail })
      };

      const res = await api.post('/donations', payload);
      toast.success(res.data.message);

      // Reset form and step
      setAmount('');
      setCustomAmount('');
      setMessage('');
      setTransactionId('');
      setDonationStep(1);

      // We don't update local campaign stats immediately since status is 'pending'

    } catch (error) {
      toast.error(error.response?.data?.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!campaign) return <div className="text-center py-20 text-xl font-medium">Campaign not found</div>;

  const imageUrl = campaign.image ? (campaign.image.startsWith('http') ? campaign.image : `http://localhost:5000${campaign.image}`) : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop';
  const presetAmounts = [500, 1000, 2500, 5000];

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb equivalent / Category badge */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-600">
            {campaign.category}
          </span>
          {campaign.isVerified && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-50 border border-green-200 text-green-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Genuine
            </span>
          )}
          {campaign.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-500">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display leading-tight">
              {campaign.title}
            </h1>

            <div className="rounded-2xl overflow-hidden shadow-md">
              <img src={imageUrl} alt={campaign.title} className="w-full h-auto object-cover max-h-[500px]" />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl">
                  {campaign.creator?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Organizer</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{campaign.creator?.name || 'Anonymous'}</p>
                    {campaign.creator?.accountType === 'ngo' && campaign.creator?.isVerifiedNgo && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 text-blue-700" title="Verified NGO">
                        <ShieldCheck className="w-3 h-3" /> NGO
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 flex items-center justify-end gap-1">
                  <MapPin className="w-4 h-4" /> {campaign.location || 'Global'}
                </p>
                {campaign.beneficiary && (
                  <p className="text-sm font-medium text-slate-700 mt-0.5">Beneficiary: {campaign.beneficiary}</p>
                )}
              </div>
            </div>

            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-primary-600">
              <p className="whitespace-pre-wrap">{campaign.description}</p>
            </div>
          </div>

          {/* Right Column - Donation Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Fund Stats Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-4xl font-extrabold font-display text-slate-900 mb-2">
                    ₹{campaign.raisedAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 font-medium tracking-wide">
                    raised of <span className="text-slate-900">₹{campaign.goalAmount.toLocaleString()}</span> goal
                  </p>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(campaign.percentageRaised, 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-slate-500 font-medium">Donors</p>
                    <p className="text-lg font-bold text-slate-900">{campaign.donorCount}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-slate-500 font-medium">Time Left</p>
                    <p className="text-lg font-bold text-slate-900">{campaign.daysLeft > 0 ? `${campaign.daysLeft} d` : 'Ended'}</p>
                  </div>
                </div>

                {campaign.proofDocument && (
                  <div className="mb-6">
                    <a href={`http://localhost:5000${campaign.proofDocument}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 py-3 px-4 rounded-xl transition-colors w-full border border-primary-100">
                      <ShieldCheck className="w-4 h-4" /> View Verification Proof
                    </a>
                  </div>
                )}

                {campaign.status !== 'approved' && campaign.status !== 'completed' ? (
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-center text-sm font-medium">
                    This campaign is currently {campaign.status} and cannot accept donations at this time.
                  </div>
                ) : campaign.daysLeft <= 0 ? (
                  <div className="bg-slate-100 text-slate-600 p-4 rounded-xl text-center font-medium">
                    This campaign has ended.
                  </div>
                ) : donationStep === 1 ? (
                  /* STEP 1: Details & Amount */
                  <form onSubmit={proceedToPayment} className="space-y-5">
                    <h3 className="font-semibold text-slate-900 border-b pb-2 mb-4">Step 1: Donation Details</h3>

                    <div className="grid grid-cols-2 gap-3">
                      {presetAmounts.map(val => (
                        <button
                          key={val}
                          type="button"
                          className={`py-3 rounded-xl border font-medium transition-all ${amount === val
                            ? 'border-primary-500 bg-primary-50 border-2 text-primary-700'
                            : 'border-slate-200 hover:border-primary-300 text-slate-700'
                            }`}
                          onClick={() => { setAmount(val); setCustomAmount(''); }}
                        >
                          ₹{val.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="relative mt-3">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">₹</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Custom amount"
                        className={`form-input pl-8 py-3 bg-slate-50 ${amount === 'custom' ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount('custom');
                        }}
                        onFocus={() => setAmount('custom')}
                      />
                    </div>

                    {!user && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Guest Information</p>
                        <input type="text" placeholder="Full Name *" required value={donorName} onChange={e => setDonorName(e.target.value)} className="form-input" />
                        <input type="email" placeholder="Email Address" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} className="form-input" />
                      </div>
                    )}

                    <div>
                      <textarea
                        placeholder="Leave a message of support (optional)"
                        className="form-input resize-none h-20"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength="500"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                      />
                      <label htmlFor="anonymous" className="text-sm text-slate-600 cursor-pointer">
                        Donate anonymously
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary py-3.5 text-lg font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
                    >
                      Proceed to Payment
                    </button>
                  </form>
                ) : (
                  /* STEP 2: QR Payment & Confirmation */
                  <form onSubmit={handleDonation} className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                      <h3 className="font-semibold text-slate-900">Step 2: Pay via QR Code</h3>
                      <button
                        type="button"
                        onClick={() => setDonationStep(1)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        ← Edit Details
                      </button>
                    </div>

                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
                      <p className="text-sm font-medium text-primary-800 mb-1">Paying Amount</p>
                      <p className="text-2xl font-bold text-slate-900">₹{(amount === 'custom' ? customAmount : amount).toLocaleString()}</p>
                    </div>

                    {/* QR Code Scan and Pay Integration */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <p className="text-sm font-bold text-slate-700 mb-4">Scan using any UPI App</p>
                      <div className="p-3 bg-white border-2 border-primary-100 rounded-2xl shadow-inner">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=8179974712@axl&pn=Peddina Kavya Sri&am=${amount === 'custom' ? customAmount : amount}&cu=INR`)}`}
                          alt="Pay via QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-4 text-center font-medium">Supports Google Pay, PhonePe, Paytm, BHIM</p>
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-2 w-full text-left">
                        <p className="text-xs text-red-700 leading-tight">
                          <span className="font-bold text-red-900">ANTI-FRAUD WARNING:</span> Only the exact selected amount will be accepted. The amount is pre-filled in your UPI app. Do not edit it.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700">
                        Transaction / Reference ID (REQUIRED)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter 12-digit UPI Ref/Transaction ID"
                        className="form-input text-center text-lg tracking-wider font-mono bg-slate-50 focus:bg-white"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                      <p className="text-[10px] text-slate-400 italic text-center">
                        Wait for payment success in your app before entering the Ref ID above.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={donating}
                      className="w-full btn-primary py-4 text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 disabled:opacity-70"
                    >
                      {donating ? 'Recording Donation...' : 'I Have Successfully Paid'}
                    </button>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] text-slate-600 leading-tight">
                        <span className="font-bold text-slate-900">Note:</span> Your donation will be verified by our admin team using the transaction ID before appearing on the platform.
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Recent Donations */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <HeartPulse className="w-5 h-5 text-primary-500" /> Recent Supporters
                </h3>

                {recentDonations.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Be the first to donate!</p>
                ) : (
                  <div className="space-y-5">
                    {recentDonations.map(donation => (
                      <div key={donation._id} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {donation.anonymous ? 'Anonymous' : donation.donorName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-primary-600">₹{donation.amount.toLocaleString()}</span>
                            <span className="text-xs text-slate-400">• {formatDistanceToNow(new Date(donation.createdAt))} ago</span>
                          </div>
                          {donation.message && (
                            <p className="text-sm text-slate-600 mt-1 italic break-words">"{donation.message}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
