import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Camera, Save, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
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
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
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
      </div>
    </div>
  );
};

export default Profile;
