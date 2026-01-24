// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Camera, Save, User, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

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

  // -----------------------------------------------------------------
  // Fetch user data
  // -----------------------------------------------------------------
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const res = await api('/user');
      const userData = await res.json();

      setUser(userData);
      setForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        mobile: userData.mobile || '',
        address: userData.address || '',
        farmSize: userData.farm_size || '',
        mainCrops: userData.main_crops || '',
        experience: userData.experience || '',
      });
      setPhoto(userData.photo_url || null);
    } catch (err) {
      if (err.message !== 'unauthorized') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Load profile on mount
  // -----------------------------------------------------------------
  useEffect(() => {
    fetchUserData();
  }, []);

  // -----------------------------------------------------------------
  // Input change handler
  // -----------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // -----------------------------------------------------------------
  // Form validation
  // -----------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (form.mobile && !/^\+?\d{10,15}$/.test(form.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Invalid phone number';
    }
    if (form.farmSize && isNaN(Number(form.farmSize))) newErrors.farmSize = 'Must be a number';
    if (form.experience && isNaN(Number(form.experience))) newErrors.experience = 'Must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------------------------------------------
  // Submit profile updates
  // -----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await api('/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

      const updated = await res.json();
      setUser(updated);
      setPhoto(updated.photo_url || null);

      // Keep sidebar in sync
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: `${updated.first_name} ${updated.last_name}`.trim(),
          email: updated.email,
          role: updated.category,
        })
      );

      toast({ title: 'Success', description: 'Profile updated successfully!' });
    } catch (err) {
      if (err.message !== 'unauthorized') {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Photo upload
  // -----------------------------------------------------------------
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await api('/user/photo', { method: 'POST', body: fd });
      const { photo_url } = await res.json();
      setPhoto(photo_url);
      await fetchUserData();
      toast({ title: 'Success', description: 'Profile photo updated!' });
    } catch (err) {
      if (err.message !== 'unauthorized') {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Photo removal
  // -----------------------------------------------------------------
  const handlePhotoRemove = async () => {
    setIsLoading(true);
    try {
      await api('/user/photo', { method: 'DELETE' });
      setPhoto(null);
      await fetchUserData();
      toast({ title: 'Success', description: 'Profile photo removed!' });
    } catch (err) {
      if (err.message !== 'unauthorized') {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800">
          My Profile
        </h1>

        {isLoading && !user ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-lg">
            {/* Header with photo */}
            <div className="h-32 sm:h-40 bg-gradient-to-r from-green-600 to-green-400 relative">
              <div className="absolute -bottom-12 sm:-bottom-14 left-6 sm:left-8">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                    {photo ? (
                      <img
                        src={`${photo}?t=${Date.now()}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setPhoto(null)}
                      />
                    ) : (
                      <User className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400" />
                    )}
                  </div>

                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 p-2 rounded-full text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
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

              {/* ---------- FORM ---------- */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
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
                      } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors`}
                      disabled={isLoading}
                    />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
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
                      } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors`}
                      disabled={isLoading}
                    />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
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
                      } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors`}
                      disabled={isLoading}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>

                  {/* Address (full width) */}
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Your farm address"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* ---------- FARM DETAILS ---------- */}
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Farm Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {/* Farm Size */}
                    <div>
                      <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-1">
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
                        } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors`}
                        disabled={isLoading}
                      />
                      {errors.farmSize && <p className="text-red-500 text-xs mt-1">{errors.farmSize}</p>}
                    </div>

                    {/* Main Crops */}
                    <div>
                      <label htmlFor="mainCrops" className="block text-sm font-medium text-gray-700 mb-1">
                        Main Crops
                      </label>
                      <input
                        id="mainCrops"
                        type="text"
                        name="mainCrops"
                        value={form.mainCrops}
                        onChange={handleChange}
                        placeholder="e.g., Wheat, Corn"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
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
                        } px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 transition-colors`}
                        disabled={isLoading}
                      />
                      {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                    </div>
                  </div>
                </div>

                {/* ---------- SAVE BUTTON ---------- */}
                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    disabled={isLoading}
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