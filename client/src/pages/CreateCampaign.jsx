import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, Target, MapPin, Calendar, Tag, ShieldAlert } from 'lucide-react';

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'medical',
    goalAmount: '',
    deadline: '',
    beneficiary: '',
    location: '',
    description: '',
    tags: '',
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [proofDocument, setProofDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be less than 5MB');
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Document must be less than 5MB');
      }
      setProofDocument(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      return toast.error('Please upload a cover image');
    }
    
    // Validate deadline
    const selectedDate = new Date(formData.deadline);
    const today = new Date();
    if (selectedDate <= today) {
      return toast.error('Deadline must be in the future');
    }

    setLoading(true);

    const uploadData = new FormData();
    Object.keys(formData).forEach(key => {
      uploadData.append(key, formData[key]);
    });
    uploadData.append('image', image);
    if (proofDocument) {
      uploadData.append('proofDocument', proofDocument);
    }

    try {
      await api.post('/campaigns', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Campaign created! Waiting for admin approval.');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Start a Fundraiser
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Fill out the details below to start your campaign. All campaigns undergo a quick review process before going live to ensure safety and transparency.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 space-y-8">
          
          {/* Section 1: Basics */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="w-5 h-5 text-primary-500" /> 1. Basics
            </h3>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label" htmlFor="title">Campaign Title *</label>
                <input
                  id="title" name="title" type="text" required maxLength="100"
                  placeholder="Help [Name] fight [Condition]"
                  className="form-input"
                  value={formData.title} onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="category">Category *</label>
                <select id="category" name="category" required className="form-input" value={formData.category} onChange={handleChange}>
                  <option value="medical">Medical & Healthcare</option>
                  <option value="emergency">Emergency Relief</option>
                  <option value="education">Education</option>
                  <option value="community">Community Support</option>
                  <option value="environment">Environment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="beneficiary">Beneficiary Name (Optional)</label>
                <input
                  id="beneficiary" name="beneficiary" type="text" 
                  placeholder="Who are the funds for?"
                  className="form-input"
                  value={formData.beneficiary} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Timeline */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2 pb-4 border-b border-slate-100">
              <Target className="w-5 h-5 text-primary-500" /> 2. Goals & Timeline
            </h3>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label" htmlFor="goalAmount">Goal Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 font-medium">₹</span>
                  <input
                    id="goalAmount" name="goalAmount" type="number" min="100" required
                    placeholder="50000"
                    className="form-input pl-8"
                    value={formData.goalAmount} onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="deadline">Target Deadline *</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400"><Calendar className="w-5 h-5"/></div>
                  <input
                    id="deadline" name="deadline" type="date" required
                    className="form-input pl-10"
                    value={formData.deadline} onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label" htmlFor="location">Location *</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400"><MapPin className="w-5 h-5"/></div>
                  <input
                    id="location" name="location" type="text" required
                    placeholder="City, State"
                    className="form-input pl-10"
                    value={formData.location} onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400"><Tag className="w-5 h-5"/></div>
                  <input
                    id="tags" name="tags" type="text"
                    placeholder="cancer, surgery, urgent"
                    className="form-input pl-10"
                    value={formData.tags} onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Story & Media */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2 pb-4 border-b border-slate-100">
              <UploadCloud className="w-5 h-5 text-primary-500" /> 3. Story, Media & Documents
            </h3>
            
            <div className="mt-6 space-y-6">
              <div>
                <label className="form-label" htmlFor="description">Campaign Story *</label>
                <p className="text-xs text-slate-500 mb-2">Explain why you are raising funds, how the money will be used, and the impact it will have.</p>
                <textarea
                  id="description" name="description" required rows="8"
                  placeholder="Hi, my name is..."
                  className="form-input resize-none"
                  value={formData.description} onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label className="form-label">Cover Image * (Max 5MB)</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl overflow-hidden relative transition-colors hover:border-primary-400 hover:bg-slate-50">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img src={imagePreview} alt="Preview" className="mx-auto max-h-64 rounded-lg object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-slate-50">
                          Change Image
                          <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" required accept="image/*" onChange={handleImageChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label text-slate-900 font-bold mb-2 block">
                  Verification Document (Optional but highly recommended)
                  <p className="text-xs text-slate-500 font-normal mt-1 mb-2">Upload medical reports, government ID, or other proof (Max 5MB) to help verify your campaign's genuineness.</p>
                </label>
                <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl relative hover:border-primary-400 hover:bg-slate-50 transition-colors bg-white">
                  <div className="space-y-2 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="doc-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>{proofDocument ? proofDocument.name : 'Upload Document'}</span>
                        <input id="doc-upload" name="doc-upload" type="file" className="sr-only" accept=".pdf,image/*" onChange={handleDocumentChange} />
                      </label>
                    </div>
                    {!proofDocument && <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 5MB</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6">
              <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Trust & Safety Guidelines</p>
                <p>Do not use copyright material. Ensure all claims made in the story are factual. All campaigns are vetted before approval to maintain platform integrity.</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-500/25"
            >
              {loading ? 'Submitting...' : 'Submit Campaign for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
