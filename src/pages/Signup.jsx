
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('Weak');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup form submitted');
  };

  return (
    <div className="min-h-screen bg-agritech-paleGreen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left side - Signup form */}
        <div className="p-8 md:p-12 w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-6">Join our farming community today</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  id="firstName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green" 
                  placeholder="Enter first name"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  id="lastName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green" 
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green" 
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green" 
                  placeholder="Create password"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length > 8) setPasswordStrength('Strong');
                    else if (val.length > 5) setPasswordStrength('Medium');
                    else setPasswordStrength('Weak');
                  }}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-red-500 text-xs">Weak</p>
                <p className="text-xs">Password Strength</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green" 
                  placeholder="Confirm password"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 mt-1 text-agritech-green focus:ring-agritech-green border-gray-300 rounded"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms(!agreedToTerms)}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <Link to="/terms" className="text-agritech-green hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-agritech-green hover:underline">Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green"
            >
              Create Account
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-agritech-green font-medium hover:underline">Sign in</Link>
          </p>
        </div>
        
        {/* Right side - Image and info */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/24600f67-3c2c-4eac-8ddc-cd77bc25260c.png')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <svg className="h-6 w-6 text-agritech-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <h3 className="ml-2 text-sm font-medium text-white">Smart Solutions</h3>
              </div>
              <p className="text-xs text-white/80">For modern farming</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-auto">
              <h3 className="text-xl font-bold text-white mb-2">Start Your Farming Journey</h3>
              <p className="text-white/80">Access smart tools and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
