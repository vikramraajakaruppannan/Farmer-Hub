
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Check, Clock, Shield, Zap } from 'lucide-react';

const ResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-agritech-paleGreen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left side - Success message */}
        <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-agritech-paleGreen flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-agritech-green flex items-center justify-center">
              <Check className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <Lock className="h-6 w-6 text-agritech-green mb-2" />
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password</h2>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset</h2>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Successful!</h2>
          
          <p className="text-gray-600 mb-8">Your account has been secured with your new password.</p>
          
          <div className="bg-gray-50 p-6 rounded-lg w-full mb-8">
            <h3 className="font-medium text-gray-800 mb-4">Next Steps</h3>
            
            <div className="flex items-start mb-4">
              <div className="flex items-center justify-center bg-agritech-green text-white rounded-full w-6 h-6 flex-shrink-0 mr-3">
                1
              </div>
              <p className="text-sm text-gray-700 text-left">Sign in with your new password</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center justify-center bg-agritech-green text-white rounded-full w-6 h-6 flex-shrink-0 mr-3">
                2
              </div>
              <p className="text-sm text-gray-700 text-left">Review your security settings</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green"
          >
            Return to Login
          </button>
          
          <p className="text-xs text-gray-500 mt-4 flex items-center justify-center">
            <Clock className="h-3 w-3 mr-1" /> Redirecting in 60 seconds
          </p>
        </div>
        
        {/* Right side - Image and info */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/lovable-uploads/55002fd8-613b-4c24-9da9-95683176bdd3.png')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <Shield className="h-6 w-6 text-white" />
                <h3 className="ml-2 text-sm font-medium text-white">Account Secured</h3>
              </div>
              <p className="text-xs text-white/80">Enhanced protection activated</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <span className="block text-xl font-bold text-white">100%</span>
                  <span className="text-xs text-white/80">Secure</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center">
                <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <span className="block text-xl font-bold text-white">24/7</span>
                  <span className="text-xs text-white/80">Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccess;
