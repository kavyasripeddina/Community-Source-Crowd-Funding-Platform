import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LogOut, User, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary-600" fill="currentColor" />
              <span className="text-xl font-bold font-display text-slate-900 tracking-tight">HopeBridge</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/campaigns" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
              Explore Campaigns
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/create-campaign" className="flex items-center gap-1 text-slate-600 hover:text-primary-600 font-medium transition-colors">
                  <PlusCircle className="w-5 h-5" /> Start a Fundraiser
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                    <User className="w-4 h-4" /> {user.name}
                  </button>
                  <div className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-slate-400 rounded-md hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? <X className="block w-6 h-6" /> : <Menu className="block w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/campaigns" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">
              Explore Campaigns
            </Link>
            {user ? (
              <>
                <Link to="/create-campaign" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">
                  Start a Fundraiser
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-4 px-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn-outline w-full justify-center">Log in</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full justify-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
