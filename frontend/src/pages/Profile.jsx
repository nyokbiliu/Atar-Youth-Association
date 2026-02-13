import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiSave, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiImage } from 'react-icons/fi';
import ImageUpload from '../components/ImageUpload';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Helper: Resolve full image URL for backend-served images
const resolveImageUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `http://localhost:5000${url.startsWith('/') ? url : `/${url}`}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [serverProfilePhoto, setServerProfilePhoto] = useState(null); // Track DB-stored photo path
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'male',
    date_of_birth: '',
    county: '',
    payam: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authAPI.getProfile();
        if (data?.success && data.user) {
          const user = data.user;
          // Set form data
          setFormData({
            full_name: user.profile?.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.profile?.gender || 'male',
            date_of_birth: user.profile?.dateOfBirth ? 
              new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
            county: user.profile?.county || '',
            payam: user.profile?.payam || '',
            bio: user.profile?.bio || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          // CRITICAL: Store server photo path for display
          setServerProfilePhoto(user.profile?.profilePhotoUrl || null);
        }
      } catch (err) {
        setError('Failed to load profile. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePhotoSelect = (file, errorMsg) => {
    setProfilePhotoFile(file);
    setPhotoError(errorMsg);
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.county.trim()) {
      setError('County is required');
      return false;
    }
    if (!formData.payam.trim()) {
      setError('Payam is required');
      return false;
    }
    if (formData.phone && !/^\+211\d{9}$/.test(formData.phone)) {
      setError('Invalid South Sudan phone format (+211XXXXXXXXX)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const profileData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        county: formData.county.trim(),
        payam: formData.payam.trim(),
        bio: formData.bio.trim()
      };

      let response;
      if (profilePhotoFile) {
        const formDataUpload = new FormData();
        Object.keys(profileData).forEach(key => {
          formDataUpload.append(key, profileData[key]);
        });
        formDataUpload.append('profilePhoto', profilePhotoFile);
        response = await authAPI.updateProfileWithPhoto(formDataUpload);
      } else {
        response = await authAPI.updateProfile(profileData);
      }

      if (response.success) {
        setSuccess('Profile updated successfully!');
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.user));
        // Update server photo path from response
        if (response.user.profile?.profilePhotoUrl) {
          setServerProfilePhoto(response.user.profile.profilePhotoUrl);
        }
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword) {
      setError('All password fields are required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await authAPI.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        authAPI.logout();
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Resolve current photo URL for display (backend URL + path)
  const displayPhotoUrl = serverProfilePhoto 
    ? resolveImageUrl(serverProfilePhoto) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'User')}&background=0ea5e9&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success/Error Alerts */}
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center animate-fade-in">
            <FiCheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div className="font-medium">{success}</div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center animate-fade-in">
            <FiAlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with REAL uploaded photo */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white/20 flex items-center justify-center">
                  {serverProfilePhoto ? (
                    <img 
                      src={displayPhotoUrl} 
                      alt={formData.full_name || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'User')}&background=0ea5e9&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <FiUser className="w-16 h-16 text-white/80" />
                  )}
                </div>
              </div>
              <div className="md:ml-6 mt-2 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-bold">{formData.full_name || 'User Profile'}</h1>
                <p className="text-primary-200 mt-1 text-lg">
                  {formData.county && formData.payam 
                    ? `${formData.payam}, ${formData.county}` 
                    : 'Manage your personal information and account settings'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary-800/50 text-sm rounded-full">
                    {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'User'}
                  </span>
                  <span className="px-3 py-1 bg-primary-800/50 text-sm rounded-full">
                    Member since {new Date().getFullYear() - 5}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Photo Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <p className="text-xs text-gray-500">Upload a clear face photo</p>
              </div>
              <div className="md:col-span-2">
                <ImageUpload 
                  currentImage={displayPhotoUrl} 
                  onFileSelect={handlePhotoSelect}
                  error={photoError}
                />
              </div>
            </div>

            {/* Rest of form sections remain identical to your original code */}
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Details
                </label>
                <p className="text-xs text-gray-500">Basic information about yourself</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="input-field pl-10"
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio (Optional)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="input-field"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 250 characters</p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <p className="text-xs text-gray-500">Your administrative location in South Sudan</p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                    County <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="county"
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Central Equatoria"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="payam" className="block text-sm font-medium text-gray-700 mb-1">
                    Payam <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="payam"
                      name="payam"
                      value={formData.payam}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Juba"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Info
                </label>
                <p className="text-xs text-gray-500">How we can reach you</p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="+211912345678"
                      pattern="\+211[0-9]{9}"
                    />
                    <p className="text-xs text-gray-500 mt-1">South Sudan format: +211XXXXXXXXX</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !!photoError}
                className={`btn-primary flex items-center justify-center ${
                  saving ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Password Section */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security
                </label>
                <p className="text-xs text-gray-500">Update your password</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="input-field pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input-field pl-10 pr-12"
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pl-10 pr-12"
                      minLength="6"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className={`bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors ${
                      saving ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Account Status: Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;