import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ApplicationProgress } from './PropertyDetailsForm';

const FinancialInfoForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    investmentBudget: '',
    monthlyIncome: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
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
    if (!formData.investmentBudget) newErrors.investmentBudget = 'Please fill this field';
    if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Please fill this field';
    if (!formData.bankName) newErrors.bankName = 'Please fill this field';
    if (!formData.accountNumber) newErrors.accountNumber = 'Please fill this field';
    if (!formData.ifscCode) newErrors.ifscCode = 'Please fill this field';
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate('/investment/apply/documents');
  };

  const handleBack = () => {
    navigate('/investment/apply/farming-plan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-800">Investment Application</h1>
        <ApplicationProgress currentStep={2} />
        
        <Card className="p-6 shadow-lg border border-green-100 bg-white/90">
          <h2 className="text-xl font-medium mb-6">Financial Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Budget (in ₹)
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                name="investmentBudget"
                value={formData.investmentBudget}
                onChange={handleChange}
                placeholder="Enter your total investment budget"
                required
              />
              {errors.investmentBudget && (
                <p className="text-red-500 text-xs mt-1">{errors.investmentBudget}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income (in ₹)
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Enter your average monthly income"
                required
              />
              {errors.monthlyIncome && (
                <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
              />
              {errors.bankName && (
                <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
                <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                required
              />
              {errors.ifscCode && (
                <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>
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

export default FinancialInfoForm;