import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary-500" fill="currentColor" />
              <span className="text-xl font-bold font-display text-white tracking-tight">HopeBridge</span>
            </Link>
            <p className="text-sm text-slate-400">
              Empowering communities to support each other through transparent, impactful crowdfunding for medical emergencies and social causes.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/campaigns" className="hover:text-primary-400 transition-colors">Explore</Link></li>
              <li><Link to="/create-campaign" className="hover:text-primary-400 transition-colors">Start Fundraiser</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary-400 transition-colors">How it works</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
              <li><Link to="/trust" className="hover:text-primary-400 transition-colors">Trust & Safety</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} HopeBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
