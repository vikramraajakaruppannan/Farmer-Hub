// src/components/application/ApplicationProgress.jsx
import React from 'react';

const ApplicationProgress = ({ currentStep }) => {
  const steps = [
    'Property Details',
    'Farming Plan',
    'Financial Info',
    'Documents',
    'Review'
  ];

  return (
    <div className="mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-3 text-sm font-medium">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex-1 text-center ${
              index < currentStep ? 'text-green-600' :
              index === currentStep ? 'text-green-700 font-semibold' :
              'text-gray-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        {/* Step indicators */}
        {steps.map((_, index) => (
          <div
            key={index}
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              index < currentStep ? 'bg-green-600 border-green-600' :
              index === currentStep ? 'bg-white border-green-600 scale-125 shadow-lg' :
              'bg-gray-300 border-gray-300'
            }`}
            style={{ left: `${(index / (steps.length - 1)) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicationProgress;