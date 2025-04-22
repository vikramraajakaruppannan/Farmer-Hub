import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Camera, Save, User, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    address: '',
    farmSize: '',
    mainCrops: '',
    experience: '',
  });
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialFormRef = useRef(null);

  // Fetch user data from backend
  const fetchUserData = async () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      console.error('No session ID found, redirecting to login');
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: 'Please log in again.',
      });
      navigate('/login', { replace: true });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/user', {
        headers: { 'X-Session-ID': sessionId },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user data');
      }
      const userData = await response.json();
      console.log('Fetched user data:', userData);
      setUser(userData);
      const newForm = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        mobile: userData.mobile || '',
        address: userData.address || '',
        farmSize: userData.farm_size || '',
        mainCrops: userData.main_crops || '',
        experience: userData.experience || '',
      };
      setForm(newForm);
      initialFormRef.current = newForm; // Store initial form state for reset
      setPhoto(userData.photo_url || null);
      console.log('Set photo state:', userData.photo_url || 'null');
    } catch (err) {
      console.error('Fetch user data error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load profile data.',
      });
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    fetchUserData();

    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, toast]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (form.mobile && !/^\+?\d{10,15}$/.test(form.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Invalid phone number';
    }
    if (form.farmSize && isNaN(form.farmSize)) newErrors.farmSize = 'Farm size must be a number';
    if (form.experience && isNaN(form.experience)) newErrors.experience = 'Experience must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const sessionId = localStorage.getItem('session_id');

    try {
      const response = await fetch('http://localhost:8000/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          mobile: form.mobile,
          address: form.address,
          farm_size: form.farmSize,
          main_crops: form.mainCrops,
          experience: form.experience,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      console.log('Updated user data:', updatedUser);
      setUser(updatedUser);
      setPhoto(updatedUser.photo_url || null);
      initialFormRef.current = form; // Update initial form state
      console.log('Set photo state after update:', updatedUser.photo_url || 'null');
      localStorage.setItem('user', JSON.stringify({
        name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
        email: updatedUser.email,
        role: updatedUser.category,
      }));

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.warn('No file selected for upload');
      return;
    }

    setIsLoading(true);
    const sessionId = localStorage.getItem('session_id');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading photo:', file.name);
      const response = await fetch('http://localhost:8000/user/photo', {
        method: 'POST',
        headers: { 'X-Session-ID': sessionId },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload photo');
      }

      const { photo_url } = await response.json();
      console.log('Photo upload response:', { photo_url });

      setPhoto(photo_url);
      console.log('Set photo state after upload:', photo_url);
      await fetchUserData(); // Refresh user data

      toast({
        title: 'Success',
        description: 'Profile photo updated successfully!',
      });
    } catch (err) {
      console.error('Photo upload error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle photo removal
  const handlePhotoRemove = async () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem('session_id');

    try {
      const response = await fetch('http://localhost:8000/user/photo', {
        method: 'DELETE',
        headers: { 'X-Session-ID': sessionId },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove photo');
      }

      console.log('Photo removed successfully');
      setPhoto(null);
      await fetchUserData(); // Refresh user data

      toast({
        title: 'Success',
        description: 'Profile photo removed successfully!',
      });
    } catch (err) {
      console.error('Photo removal error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 animate-fade-in">
          My Profile
        </h1>

        {isLoading && !user ? (
          <div className="flex justify-center items-center h-64" aria-live="polite" aria-busy="true">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agritech-green"></div>
          </div>
        ) : (
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-lg animate-fade-in">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-agritech-green/80 to-agritech-lightGreen/80 relative">
              <div className="absolute -bottom-12 sm:-bottom-14 left-6 sm:left-8">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                    {photo ? (
                      <img
                        src={`${photo}?t=${Date.now()}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image load error:', e, 'URL:', photo);
                          setPhoto(null);
                        }}
                        onLoad={() => console.log('Image loaded successfully:', photo)}
                      />
                    ) : (
                      <User className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-agritech-green p-2 rounded-full text-white hover:bg-agritech-darkGreen disabled:opacity-50 transition-colors"
                      disabled={isLoading}
                      aria-label="Upload new profile photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    {photo && (
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                        disabled={isLoading}
                        aria-label="Remove profile photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={isLoading}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
            <CardContent className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-6 sm:px-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800">
                {user ? `${user.first_name} ${user.last_name}`.trim() : 'User'}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6 capitalize">
                {user?.category || 'No category'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors`}
                      disabled={isLoading}
                      aria-invalid={!!errors.first_name}
                      aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                    />
                    {errors.first_name && (
                      <p
                        id="first_name-error"
                        className="text-red-500 text-xs mt-1"
                        role="alert"
                      >
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors`}
                      disabled={isLoading}
                      aria-invalid={!!errors.last_name}
                      aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                    />
                    {errors.last_name && (
                      <p
                        id="last_name-error"
                        className="text-red-500 text-xs mt-1"
                        role="alert"
                      >
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed transition-colors"
                      disabled
                      aria-disabled="true"
                    />
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full rounded-md border ${
                        errors.mobile ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors`}
                      disabled={isLoading}
                      aria-invalid={!!errors.mobile}
                      aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                    />
                    {errors.mobile && (
                      <p id="mobile-error" className="text-red-500 text-xs mt-1" role="alert">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 relative">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Your farm address"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Farm Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="relative">
                      <label
                        htmlFor="farmSize"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Farm Size (acres)
                      </label>
                      <input
                        id="farmSize"
                        type="text"
                        name="farmSize"
                        value={form.farmSize}
                        onChange={handleChange}
                        placeholder="e.g., 50"
                        className={`w-full rounded-md border ${
                          errors.farmSize ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors`}
                        disabled={isLoading}
                        aria-invalid={!!errors.farmSize}
                        aria-describedby={errors.farmSize ? 'farmSize-error' : undefined}
                      />
                      {errors.farmSize && (
                        <p
                          id="farmSize-error"
                          className="text-red-500 text-xs mt-1"
                          role="alert"
                        >
                          {errors.farmSize}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="mainCrops"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Main Crops
                      </label>
                      <input
                        id="mainCrops"
                        type="text"
                        name="mainCrops"
                        value={form.mainCrops}
                        onChange={handleChange}
                        placeholder="e.g., Wheat, Corn"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="relative">
                      <label
                        htmlFor="experience"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Years of Experience
                      </label>
                      <input
                        id="experience"
                        type="text"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder="e.g., 15"
                        className={`w-full rounded-md border ${
                          errors.experience ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100 transition-colors`}
                        disabled={isLoading}
                        aria-invalid={!!errors.experience}
                        aria-describedby={errors.experience ? 'experience-error' : undefined}
                      />
                      {errors.experience && (
                        <p
                          id="experience-error"
                          className="text-red-500 text-xs mt-1"
                          role="alert"
                        >
                          {errors.experience}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-agritech-green text-white rounded-md shadow-sm hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    disabled={isLoading}
                    aria-label="Save profile changes"
                  >
                    {isLoading ? (
                      <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
