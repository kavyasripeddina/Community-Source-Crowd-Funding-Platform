import { useState, useEffect } from 'react';
import api from '../utils/api';
import CampaignCard from '../components/CampaignCard';
import { PageSpinner, Spinner } from '../components/Spinner';
import { Search, Filter, X } from 'lucide-react';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCampaigns(1, true);
  }, [debouncedSearch, category]);

  const fetchCampaigns = async (pageNum = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;

      const res = await api.get('/campaigns', { params });
      
      if (reset) {
        setCampaigns(res.data.data);
      } else {
        setCampaigns((prev) => [...prev, ...res.data.data]);
      }
      setPagination(res.data.pagination);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching campaigns', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page < pagination?.pages) {
      fetchCampaigns(page + 1, false);
    }
  };

  const categories = ['medical', 'emergency', 'education', 'community', 'environment', 'other'];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 font-display mb-8">
            Fundraisers to Support
          </h1>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title, description, or beneficiary..."
                className="form-input pl-10 border-none bg-slate-50 focus:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="w-px bg-slate-200 hidden md:block"></div>
            
            <div className="relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                className="form-input pl-10 border-none bg-slate-50 focus:ring-0 appearance-none font-medium text-slate-700 capitalize"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <Spinner />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-slate-900">No campaigns found</h3>
            <p className="mt-1 text-slate-500">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
            
            {pagination && page < pagination.pages && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-outline px-8"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
