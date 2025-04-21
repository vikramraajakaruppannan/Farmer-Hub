import React from 'react';
import { Eye, EyeOff, Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResetPasswordUI = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#A6E483' }}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        <div className="p-8 md:p-12 w-full md:w-1/2">
          <Link to="/VerificationCode" className="flex items-center text-sm text-agritech-green hover:underline mb-4">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600 mb-6">Create a new password for your farm account</p>

          {/* Success/Error Messages - Static */}
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">Password reset successfully</div>
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">Passwords do not match</div>

          <form className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green"
                  placeholder="Create new password"
                  disabled
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  disabled
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-amber-500">Medium</p>
                <p className="text-xs">Password Strength</p>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green"
                  placeholder="Confirm new password"
                  disabled
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  disabled
                >
                  <EyeOff className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Password Rules Box */}
            <div className="rounded-md p-4 bg-agritech-paleGreen">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Password Requirements</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-center"><Check className="h-4 w-4 text-agritech-green mr-2" />Minimum 8 characters</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-agritech-green mr-2" />At least one uppercase letter</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-agritech-green mr-2" />At least one number</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-agritech-green mr-2" />At least one special character</li>
              </ul>
            </div>

            {/* Submit Button - Disabled for UI only */}
            <button
              type="button"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green disabled:opacity-50"
              disabled
            >
              Reset Password
            </button>
          </form>
        </div>

        {/* Right side image section */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571509107684-7e3034a90012?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fGFncmljdWx0dXJlfGVufDB8fDB8fHww')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <Lock className="h-6 w-6 text-white" />
                <h3 className="ml-2 text-sm font-medium text-white">Security First</h3>
              </div>
              <p className="text-xs text-white/80">Your data is important to us</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-auto">
              <h3 className="text-xl font-bold text-white mb-2">Keep Your Account Safe</h3>
              <p className="text-white/80">Protect your farming data with a strong password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordUI;
