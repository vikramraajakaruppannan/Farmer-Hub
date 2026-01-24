import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

const ApplicationProgress = ({ currentStep }) => {
  const steps = ['Property Details', 'Farming Plan', 'Financial Info', 'Documents', 'Review'];
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className={`flex-1 text-center ${
            index < currentStep ? 'text-green-600' : 
            index === currentStep ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className="text-xs">{step}</div>
          </div>
        ))}
      </div>
      <div className="flex mb-4">
        {steps.map((_, index) => (
          <div key={index} className="flex-1">
            <div className={`h-2 ${
              index < currentStep ? 'bg-green-500' :
              index === currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PropertyDetailsForm = () => {
  const navigate = useNavigate();
  
  const handleNext = () => {
    navigate('/investment/apply/farming-plan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-800">Investment Application</h1>
        <ApplicationProgress currentStep={0} />
        
        <Card className="p-6 shadow-lg border border-green-100 bg-white/90">
          <h2 className="text-xl font-medium mb-6">Property Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <Input 
                type="text" 
                value="Premium Farmland" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input 
                type="text" 
                value="North Bangalore" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment per acre/year
              </label>
              <Input 
                type="text" 
                value="₹25,000" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name
              </label>
              <Input 
                type="text" 
                value="Priya Sharma" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/investment/property/1')}
            >
              Back
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { ApplicationProgress };
export default PropertyDetailsForm;