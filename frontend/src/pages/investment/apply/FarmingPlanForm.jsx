import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ApplicationProgress } from './PropertyDetailsForm';

const FarmingPlanForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaseDuration: '',
    startDate: '',
    crops: '',
    experience: '',
    equipment: '',
    workers: '',
    investment: null,
    investPercentage: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.leaseDuration) newErrors.leaseDuration = 'Please fill this field';
    if (!formData.startDate) newErrors.startDate = 'Please fill this field';
    if (!formData.crops) newErrors.crops = 'Please fill this field';
    if (!formData.experience) newErrors.experience = 'Please fill this field';
    if (!formData.equipment) newErrors.equipment = 'Please fill this field';
    if (!formData.workers) newErrors.workers = 'Please fill this field';
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate('/investment/apply/financial-info');
  };

  const handleBack = () => {
    navigate('/investment/apply/property-details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-800">Investment Application</h1>
        <ApplicationProgress currentStep={1} />
        
        <Card className="p-6 shadow-lg border border-green-100 bg-white/90">
          <h2 className="text-xl font-medium mb-6">Farming Plan</h2>
          <p className="text-gray-600 mb-6">Tell us about your farming plans for this property</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease Duration (in years)
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                name="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleChange}
                required
              />
              {errors.leaseDuration && (
                <p className="text-red-500 text-xs mt-1">{errors.leaseDuration}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Start Date
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planned Crops
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="crops"
                value={formData.crops}
                onChange={handleChange}
                placeholder="e.g., Rice, Wheat, Vegetables"
                required
              />
              {errors.crops && (
                <p className="text-red-500 text-xs mt-1">{errors.crops}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farming Experience (in years)
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              />
              {errors.experience && (
                <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Equipment
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                placeholder="List your farming equipment"
                required
              />
              {errors.equipment && (
                <p className="text-red-500 text-xs mt-1">{errors.equipment}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Workers
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                name="workers"
                value={formData.workers}
                onChange={handleChange}
                required
              />
              {errors.workers && (
                <p className="text-red-500 text-xs mt-1">{errors.workers}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
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

export default FarmingPlanForm;