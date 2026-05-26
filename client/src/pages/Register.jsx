import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', accountType: 'individual', ngoRegistrationNumber: '' });
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return toast.error('Please ensure your password meets all strength requirements.');
    }

    setLoading(true);
    await register(formData.name, formData.email, formData.password, formData.accountType, formData.ngoRegistrationNumber);
    setLoading(false);
  };

  return (
    <div className="min-h-screen auth-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Heart className="w-12 h-12 text-primary-600" fill="currentColor" />
        </motion.div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-display">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100/50">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input pl-10"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="accountType">Account Type</label>
              <div className="relative rounded-md shadow-sm">
                <select
                  id="accountType"
                  name="accountType"
                  className="form-input"
                  value={formData.accountType}
                  onChange={handleChange}
                >
                  <option value="individual">Individual</option>
                  <option value="ngo">NGO / Charity</option>
                </select>
              </div>
            </div>

            {formData.accountType === 'ngo' && (
              <div>
                <label className="form-label" htmlFor="ngoRegistrationNumber">NGO Registration / Tax ID</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="ngoRegistrationNumber"
                    name="ngoRegistrationNumber"
                    type="text"
                    required
                    className="form-input"
                    placeholder="E.g., Darpan ID or Tax ID"
                    value={formData.ngoRegistrationNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {formData.password && (
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p className={formData.password.length >= 8 ? 'text-emerald-600 font-medium' : ''}>
                    {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}>
                    {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter
                  </p>
                  <p className={/\d/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}>
                    {/\d/.test(formData.password) ? '✓' : '○'} One number
                  </p>
                  <p className={/[@$!%*?&#]/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}>
                    {/[@$!%*?&#]/.test(formData.password) ? '✓' : '○'} One special character (@$!%*?&#)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-75 transition-colors"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
            <p className="text-xs text-center text-slate-500 mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
