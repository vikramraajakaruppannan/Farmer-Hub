import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import Button from '@/components/ui/button1';
import OtpInput from '@/components/ui/otpinput';

function OtpVerificationPage() {
  const { email, verifyOTP, loginWithEmail, error, loading } = useAuth();
  const [seconds, setSeconds] = useState(30);
  const navigate = useNavigate(); // Use navigate for programmatic navigation

  // Timer for resend OTP
  useEffect(() => {
    const timer = seconds > 0 && setInterval(() => setSeconds(seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // Disable back button
  useEffect(() => {
    // Push an additional history entry to block the back button
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      event.preventDefault();
      // Push the state again to keep the user on the same page
      window.history.pushState(null, null, window.location.href);
      // Optionally, show an alert or toast to inform the user
      alert("Please complete the OTP verification to proceed.");
      // Alternatively, you can use a toast notification (requires useToast from your UI library)
      // toast({ title: "Action Required", description: "Please complete the OTP verification.", variant: "destructive" });
    };

    // Add popstate event listener
    window.addEventListener('popstate', handlePopState);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Empty dependency array to run only on mount

  const resendOTP = () => {
    loginWithEmail(email);
    setSeconds(30);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Your Email</h2>
          <p className="text-center text-gray-600 mb-4">Enter the 6-digit code sent to</p>
          <p className="text-center font-medium mb-6">{email}</p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="flex justify-center mb-6">
            <OtpInput length={6} onComplete={verifyOTP} />
          </div>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Resend code in {seconds}
              {seconds === 0 && (
                <button
                  onClick={resendOTP}
                  className="ml-1 text-green-600 font-medium hover:underline"
                  disabled={loading}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
          <Button
            variant="primary"
            fullWidth
            disabled={loading}
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </Button>
          <div className="mt-6 text-center">
            <Link to="/buyer/login" className="flex items-center justify-center text-gray-600 hover:text-gray-800">
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
              Back to Buyer Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default OtpVerificationPage;