<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Camera, Save, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
=======
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Camera, Save, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
<<<<<<< HEAD
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

  const fetchUserData = async () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      console.error('No session ID found, redirecting to login');
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
      console.log('Set photo state:', userData.photo_url || 'null');
    } catch (err) {
      console.error('Fetch user data error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load profile data',
      });
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Disable back button
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    fetchUserData();

    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

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

      // Update state and refresh user data
      setPhoto(photo_url);
      console.log('Set photo state after upload:', photo_url);
      await fetchUserData(); // Ensure latest data

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
=======
    name: '',
    email: '',
    phone: '',
    address: '',
    farmSize: '',
    mainCrops: '',
    experience: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Initialize form with user data
      setForm(prevForm => ({
        ...prevForm,
        name: userData.name || '',
        email: userData.email || '',
        // Other fields would come from a real API
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update user in localStorage
    const updatedUser = {
      ...user,
      name: form.name,
      email: form.email
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Show a success message (in a real app, this would be a toast)
    alert('Profile updated successfully!');
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
<<<<<<< HEAD
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800">My Profile</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agritech-green"></div>
          </div>
        ) : (
          <Card className="overflow-hidden shadow-sm rounded-lg">
            <div className="h-32 sm:h-48 bg-gradient-to-r from-agritech-green to-agritech-lightGreen relative">
              <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-8">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                    {photo ? (
                      <img
                        src={`${photo}?t=${Date.now()}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image load error:', e, 'URL:', photo);
                          setPhoto(null); // Fallback to User icon
                        }}
                        onLoad={() => console.log('Image loaded successfully:', photo)}
                      />
                    ) : (
                      <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-agritech-green p-2 rounded-full text-white hover:bg-agritech-darkGreen disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
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
              <p className="text-sm sm:text-base text-gray-500 mb-6 capitalize">{user?.category || ''}</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100`}
                      disabled={isLoading}
                    />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className={`w-full rounded-md border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100`}
                      disabled={isLoading}
                    />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full rounded-md border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100`}
                      disabled={isLoading}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Your farm address"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <h3 className="text-lg font-medium mb-4">Farm Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
                      <input
                        type="text"
                        name="farmSize"
                        value={form.farmSize}
                        onChange={handleChange}
                        placeholder="e.g., 50"
                        className={`w-full rounded-md border ${errors.farmSize ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100`}
                        disabled={isLoading}
                      />
                      {errors.farmSize && <p className="text-red-500 text-xs mt-1">{errors.farmSize}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Main Crops</label>
                      <input
                        type="text"
                        name="mainCrops"
                        value={form.mainCrops}
                        onChange={handleChange}
                        placeholder="e.g., Wheat, Corn"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder="e.g., 15"
                        className={`w-full rounded-md border ${errors.experience ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green disabled:bg-gray-100`}
                        disabled={isLoading}
                      />
                      {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-agritech-green text-white rounded-md shadow-sm hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green disabled:bg-gray-400 disabled:cursor-not-allowed"
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
=======
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-gray-800">My Profile</h1>
          
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-agritech-green to-agritech-lightGreen relative">
                <div className="absolute -bottom-16 left-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-agritech-green p-2 rounded-full text-white">
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <CardContent className="pt-20 pb-8 px-8">
                <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                <p className="text-gray-500 mb-6">{user?.role}</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Your farm address"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Farm Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
                        <input
                          type="text"
                          name="farmSize"
                          value={form.farmSize}
                          onChange={handleChange}
                          placeholder="e.g., 50"
                          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Crops</label>
                        <input
                          type="text"
                          name="mainCrops"
                          value={form.mainCrops}
                          onChange={handleChange}
                          placeholder="e.g., Wheat, Corn"
                          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                          type="text"
                          name="experience"
                          value={form.experience}
                          onChange={handleChange}
                          placeholder="e.g., 15"
                          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agritech-green"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-3 bg-agritech-green text-white rounded-md shadow-sm hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Profile;
=======
export default Profile;
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
