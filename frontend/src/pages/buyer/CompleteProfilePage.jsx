import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import Input from '@/components/ui/input1';
import Button from '@/components/ui/button1';

function CompleteProfilePage() {
  const { email, completeProfile, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneRegex = /^\+?\d{10,15}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      alert('Please enter a valid phone number (10-15 digits, optional + prefix).');
      return;
    }
    completeProfile({
      fullName: formData.fullName,
      location: formData.location,
      phoneNumber: formData.phoneNumber,
      email,
    });
  };

  const getErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (Array.isArray(error)) {
      return error.map(e => e.msg).join('; ') || 'An error occurred';
    }
    if (typeof error === 'object' && error.detail) {
      if (Array.isArray(error.detail)) {
        return error.detail.map(e => e.msg).join('; ') || 'An error occurred';
      }
      return error.detail || 'An error occurred';
    }
    return 'An error occurred';
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-center mb-6">
            <Logo className="w-24 h-24 transform transition-transform hover:scale-105" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 tracking-tight">Complete Your Profile</h2>
          <p className="text-center text-gray-600 mb-8 text-sm">Help us personalize your experience</p>
          {errorMessage && <p className="text-red-500 text-center mb-6 font-medium">{errorMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-200"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <Input
              label="Location"
              name="location"
              placeholder="Enter your city or region"
              value={formData.location}
              onChange={handleChange}
              required
              className="border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-200"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              placeholder="e.g., +1234567890"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="border-gray-300 focus:ring-2 focus:ring-green-400 transition-all duration-200"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
            />
            <Input
              label="Email Address"
              value={email}
              disabled
              className="border-gray-300 bg-gray-100 cursor-not-allowed"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              }
            />
            <Button
              variant="primary"
              fullWidth
              type="submit"
              disabled={loading}
              className="transform transition-all duration-300 hover:scale-105 hover:bg-green-600 focus:ring-4 focus:ring-green-300"
            >
              {loading ? 'Submitting...' : 'Complete Profile'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default CompleteProfilePage;