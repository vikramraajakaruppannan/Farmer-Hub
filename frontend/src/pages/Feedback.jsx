
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const navigate = useNavigate();
  
  const handleReScan = () => {
    navigate('/disease-detection');
  };
  
  const handleSubmitFeedback = () => {
    // In a real app, we would submit the feedback
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-agritech-paleGreen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/scan-results" className="text-gray-700 hover:text-gray-900 mr-3">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Help Us Improve</h1>
        </div>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-agritech-paleGreen rounded-full flex items-center justify-center mb-6">
                <Info className="h-6 w-6 text-agritech-green" />
              </div>
              
              <p className="text-center text-gray-600 max-w-lg">
                Did this solution work for you? Your feedback helps us provide better recommendations.
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`p-2 rounded-md border ${
                      (hover || rating) >= star
                        ? 'text-agritech-yellow border-agritech-lightGreen'
                        : 'text-gray-300 border-gray-200'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <textarea
                rows="6"
                className="w-full p-4 border border-gray-300 rounded-md focus:ring-agritech-green focus:border-agritech-green"
                placeholder="Share your experience or suggestions (optional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleSubmitFeedback}
                className="px-6 py-3 bg-agritech-green text-white rounded-md font-medium hover:bg-agritech-darkGreen transition-colors"
              >
                Submit Feedback
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

export default Feedback;
