
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Image, Camera, ArrowLeft, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DiseaseDetection = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();
  
  const handleImageUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5);
      setSelectedImages(prevImages => [...prevImages, ...filesArray].slice(0, 5));
    }
  };
  
  const handleAnalyzeClick = () => {
    // In a real application, we would process the images here
    // For now, just navigate to the results page
    navigate('/scan-results');
  };
  
  const handleClearAll = () => {
    setSelectedImages([]);
  };

  return (
    <div className="flex min-h-screen bg-agritech-paleGreen">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="flex items-center mb-8">
          <div className="flex-1">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">AI Crop Disease Scanner</h1>
            </div>
          </div>
        </div>
        
        <Card className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="mx-auto flex justify-center mb-4">
                  <Image className="h-16 w-16 text-gray-400" />
                </div>
                <button 
                  className="mb-4 px-4 py-2 bg-agritech-darkGreen text-white rounded-md font-medium hover:bg-agritech-green transition-colors"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Upload Images
                </button>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-gray-600 mb-2">Drag & drop your crop images here or click to select</p>
                <p className="text-gray-500 text-sm">Supported formats: JPG, PNG (Max 5 images)</p>
                
                {selectedImages.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected image ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-8 mb-8">
                <button 
                  className="px-6 py-3 bg-agritech-darkGreen text-white rounded-md flex items-center justify-center hover:bg-agritech-green transition-colors"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Use Camera
                </button>
              </div>
              
              <div className="flex space-x-4 mt-4 w-full max-w-md justify-center">
                <button
                  className="px-6 py-3 bg-agritech-green/60 text-white rounded-md font-medium hover:bg-agritech-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAnalyzeClick}
                  disabled={selectedImages.length === 0}
                >
                  Analyze Now
                </button>
                <button
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
              
              <div className="mt-12 flex items-start bg-blue-50 p-4 rounded-md">
                <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm">
                  Upload multiple images for more accurate disease detection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseDetection;
