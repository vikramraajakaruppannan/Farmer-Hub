import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Clock, AlertCircle, Check } from 'lucide-react';

const VerificationCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'verifying', 'verified', 'error'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = location.state?.email || ''; // Get email from ForgotPassword

  // Handle input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key press
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split('').slice(0, 6);
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      }
    });
    
    setCode(newCode);
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const verifyCode = async () => {
    setVerificationStatus('verifying');
    setError('');
    setIsLoading(true);

    const fullCode = code.join('');
    try {
      const response = await fetch('http://localhost:8000/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Verification failed');

      setVerificationStatus('verified');
      setTimeout(() => {
        navigate('/reset-password', { state: { email, code: fullCode } });
      }, 1000);
    } catch (err) {
      setVerificationStatus('error');
      setError(err.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.every(digit => digit !== '')) {
      verifyCode();
    }
  };

  // Optional: Resend code functionality
  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to resend code');

      setError('');
      alert('A new code has been sent to your email. Check the backend console.');
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agritech-paleGreen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        <div className="p-8 md:p-12 w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600 mb-6">We've sent a 6-digit code to {email || 'your email'}</p>
          
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {verificationStatus === 'verified' && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">Code verified successfully!</div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-between space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green disabled:opacity-50"
                    disabled={isLoading}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="text-sm text-agritech-green hover:underline disabled:text-gray-400"
                  onClick={() => navigate('/forgot-password')}
                  disabled={isLoading}
                >
                  Wrong email?
                </button>
                <button
                  type="button"
                  className="text-sm text-agritech-green hover:underline disabled:text-gray-400"
                  onClick={handleResend}
                  disabled={isLoading}
                >
                  Resend code
                </button>
              </div>
            </div>
            
            <div className="rounded-md p-4 bg-amber-50">
              <h3 className="flex items-center text-sm font-medium text-amber-800 mb-2">
                <Clock className="mr-2 h-4 w-4" /> Verification Tips
              </h3>
              <ul className="text-sm text-amber-700 space-y-1 pl-6 list-disc">
                <li>Check your spam folder if not received</li>
                <li>Code expires in 10 minutes</li>
                <li>Enter code without spaces</li>
              </ul>
            </div>
            
            <button
              type="submit"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green disabled:bg-gray-400"
              disabled={!code.every(digit => digit !== '') || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
          
          <div className="mt-6 flex justify-center items-center space-x-8">
            <div className={`flex flex-col items-center ${verificationStatus === null ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mb-1">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-xs">Code Received</span>
            </div>
            
            <div className={`h-0.5 w-12 ${verificationStatus ? 'bg-agritech-green' : 'bg-gray-300'}`}></div>
            
            <div className={`flex flex-col items-center ${verificationStatus === 'verifying' ? 'text-agritech-green' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mb-1">
                {verificationStatus === 'verifying' && (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                {!verificationStatus && <span className="text-xs">2</span>}
              </div>
              <span className="text-xs">Verifying</span>
            </div>
            
            <div className={`h-0.5 w-12 ${verificationStatus === 'verified' ? 'bg-agritech-green' : 'bg-gray-300'}`}></div>
            
            <div className={`flex flex-col items-center ${verificationStatus === 'verified' ? 'text-agritech-green' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mb-1">
                {verificationStatus === 'verified' ? <Check className="h-4 w-4" /> : <span className="text-xs">3</span>}
              </div>
              <span className="text-xs">Verified</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1698061641625-ff9728f16b6a?w=600&auto=format&fit=crop&q=60')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <Mail className="h-6 w-6 text-white" />
                <h3 className="ml-2 text-sm font-medium text-white">Check Your Email</h3>
              </div>
              <p className="text-xs text-white/80">Enter the code we sent you</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-auto">
              <h3 className="text-xl font-bold text-white mb-2">Almost There!</h3>
              <p className="text-white/80">One step away from resetting your password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCode;