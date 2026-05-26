import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageSpinner } from './components/Spinner';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { HowItWorks, Pricing, HelpCenter, TrustAndSafety, ContactUs, LegalPolicies } from './pages/StaticPages';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PageSpinner />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { loading } = useAuth();
  
  if (loading) return <PageSpinner />;

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            
            {/* Informational Pages */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/trust" element={<TrustAndSafety />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<LegalPolicies type="terms" />} />
            <Route path="/privacy" element={<LegalPolicies type="privacy" />} />
            <Route path="/cookie-policy" element={<LegalPolicies type="cookie" />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/create-campaign" 
              element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} 
            />
            <Route 
              path="/profile" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }} 
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
