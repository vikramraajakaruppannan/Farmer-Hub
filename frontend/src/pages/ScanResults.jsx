
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ScanResults = () => {
  const navigate = useNavigate();
  
  const handleReScan = () => {
    navigate('/disease-detection');
  };
  
  const handleApplyTreatment = () => {
    navigate('/feedback');
  };
  
  return (
    <div className="min-h-screen bg-agritech-paleGreen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/disease-detection" className="text-gray-700 hover:text-gray-900 mr-3">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Scan Results</h1>
        </div>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="mb-6 bg-red-50 p-4 rounded-md flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div className="flex-1 text-gray-900 font-medium">
                Your crop has been diagnosed with Powdery Mildew
              </div>
              <div className="ml-auto flex items-center">
                <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">85% Confidence</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Organic Treatment */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-start mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Organic Treatment</h3>
                    <p className="text-sm text-gray-600">Natural and eco-friendly solution</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Application: Twice Weekly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Safe for beneficial insects</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center mr-2">
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm ml-1">95% Success Rate</span>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold mb-2">Recommended Solution</h4>
                  <p className="text-sm text-gray-600">Neem Oil Spray - Mix 2-3 tablespoons per gallon of water. Apply during early morning or late evening.</p>
                </div>
              </div>
              
              {/* Chemical Treatment */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-start mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Chemical Treatment</h3>
                    <p className="text-sm text-gray-600">Fast-acting synthetic solution</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Apply every 7-14 days</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Laboratory tested</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center mr-2">
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm ml-1">99% Success Rate</span>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold mb-2">Recommended Solution</h4>
                  <p className="text-sm text-gray-600">Fungicide X - Follow safety guidelines and wear protective equipment. Ensure proper ventilation during application.</p>
                </div>
              </div>
              
              {/* Preventive Treatment */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-start mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Preventive Treatment</h3>
                    <p className="text-sm text-gray-600">Long-term prevention strategy</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Daily monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Proper plant spacing</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center mr-2">
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm ml-1">90% Prevention Rate</span>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold mb-2">Recommended Solution</h4>
                  <p className="text-sm text-gray-600">Maintain proper air circulation and plant spacing. Regular pruning and monitoring for early detection.</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-medium mb-3">How helpful was this diagnosis?</h3>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="p-1 border border-gray-300 rounded-md">
                    <Star className="h-5 w-5 text-gray-400 hover:text-yellow-400" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleApplyTreatment}
                className="px-6 py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors"
              >
                Apply Treatment
              </button>
              <button
                onClick={handleReScan}
                className="px-6 py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900 transition-colors"
              >
                Re-Scan
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanResults;
