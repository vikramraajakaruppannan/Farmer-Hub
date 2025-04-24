import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext'; // Adjust path to point to root src/
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import Input from '@/components/ui/input1';
import Button from '@/components/ui/button1';

function LoginPage() {
  const [email, setEmail] = useState('');
  const { loginWithEmail, loading, error } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      loginWithEmail(email);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Buyer Login</h2>
          <p className="text-center text-gray-600 mb-8">Enter your email address to receive OTP</p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            <Button variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-600">
            By continuing, you agree to our
            <div className="flex justify-center gap-1 mt-1">
              <a href="/terms-and-conditions" className="text-green-600 hover:text-green-700 hover:underline">
                Terms of Service
              </a>
              <span>&</span>
              <a href="/privacy-policy" className="text-green-600 hover:text-green-700 hover:underline">
                Privacy Policy
              </a>
            </div>
            <div className="mt-6 text-center">
                        <Link to="/login" className="flex items-center justify-center text-gray-600 hover:text-gray-800">
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
                            className="mr-1"
                          >
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                          </svg>
                          Back to Login
                        </Link>
                      </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;