
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Clock, AlertCircle, Check } from 'lucide-react';

const VerificationCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'verifying', 'verified'

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key press
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data only contains digits
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split('').slice(0, 6);
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
        // Update input field value
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      }
    });
    
    setCode(newCode);
    
    // Focus the next empty input or the last one if all are filled
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    if (inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex].focus();
    }
  };

  const verifyCode = () => {
    setVerificationStatus('verifying');
    
    // Simulate verification delay
    setTimeout(() => {
      // In a real app, we would validate the code against what was sent
      setVerificationStatus('verified');
      
      // Navigate to the reset password page after verification
      setTimeout(() => {
        navigate('/reset-password');
      }, 1000);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (code.every(digit => digit !== '')) {
      verifyCode();
    }
  };

  return (
    <div className="min-h-screen bg-agritech-paleGreen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left side - Verification code form */}
        <div className="p-8 md:p-12 w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600 mb-6">We've sent a 6-digit code to your email</p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-between space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green"
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" className="text-sm text-agritech-green hover:underline">
                  Didn't receive the code?
                </button>
                <button type="button" className="text-sm text-agritech-green hover:underline">
                  Resend in 1:30
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
              disabled={!code.every(digit => digit !== '') || verificationStatus === 'verifying'}
            >
              Verify Code
            </button>
          </form>
          
          {/* Status indicator */}
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
        
        {/* Right side - Image and info */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/374e3d74-5335-414d-9b9b-1254181711ec.png')" }}>
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
