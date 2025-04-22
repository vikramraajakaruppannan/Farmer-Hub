import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Info } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to send reset code');

      setSuccess('A reset code has been sent to your email');
      setTimeout(() => navigate('/verification-code', { state: { email } }), 2000);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agritech-paleGreen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        <div className="p-8 md:p-12 w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Forgot Password?</h2>
          <p className="text-gray-600 mb-8">Enter your email to receive a verification code</p>
          
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="rounded-md p-4 bg-amber-50 flex items-start">
              <Info className="flex-shrink-0 h-5 w-5 text-amber-700 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Important Note</h3>
                <p className="mt-1 text-sm text-amber-700">Remember to enter your email correctly for the password reset process.</p>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password? <Link to="/login" className="text-agritech-green font-medium hover:underline">Back to login</Link>
          </p>
        </div>
        
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591268315196-2c9b815d71cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fGFncmljdWx0dXJlfGVufDB8fDB8fHww')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <Mail className="h-6 w-6 text-white" />
                <h3 className="ml-2 text-sm font-medium text-white">Check Your Email</h3>
              </div>
              <p className="text-xs text-white/80">We'll send you instructions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-auto">
              <h3 className="text-xl font-bold text-white mb-2">Account Recovery</h3>
              <p className="text-white/80">We'll help you get back to your farm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;