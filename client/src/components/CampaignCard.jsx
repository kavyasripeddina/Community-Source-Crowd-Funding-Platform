import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { Clock, User, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CampaignCard = ({ campaign }) => {
  // Use absolute URL for the image
  const imageUrl = campaign.image 
    ? (campaign.image.startsWith('http') ? campaign.image : `http://localhost:5000${campaign.image}`)
    : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      <Link to={`/campaign/${campaign._id}`} className="relative h-56 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={campaign.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-800 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
            {campaign.category}
          </span>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/campaign/${campaign._id}`} className="block flex-grow">
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {campaign.description}
          </p>
        </Link>
        
        <div className="mt-auto">
          <ProgressBar target={campaign.goalAmount} raised={campaign.raisedAmount} />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5 flex-wrap">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">{campaign.creator?.name || 'Anonymous'}</span>
              {campaign.creator?.accountType === 'ngo' && campaign.creator?.isVerifiedNgo && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" title="Verified NGO" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : 'Ended'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
