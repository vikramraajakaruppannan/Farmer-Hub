// src/pages/investment/FinancialInfoForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ApplicationProgress from '../apply/ApplicationProgress';

const FinancialInfoForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { property, farmingPlan } = location.state || {};

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
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.investmentBudget) newErrors.investmentBudget = 'Required';
    if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Required';
    if (!formData.bankName) newErrors.bankName = 'Required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Required';
    if (!formData.ifscCode) newErrors.ifscCode = 'Required';
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    navigate('/investment/apply/documents', {
      state: {
        property,
        farmingPlan,
        financialInfo: formData
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-800">
          Lease Application
        </h1>

        <ApplicationProgress currentStep={2} />

        <Card className="p-6 shadow-lg border border-green-100 bg-white/90">
          <h2 className="text-xl font-medium mb-6">Financial Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Budget (in ₹) <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                name="investmentBudget"
                value={formData.investmentBudget}
                onChange={handleChange}
                placeholder="e.g. 500000"
                className={errors.investmentBudget ? "border-red-500" : ""}
              />
              {errors.investmentBudget && <p className="text-red-500 text-xs mt-1">{errors.investmentBudget}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Monthly Income (in ₹) <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number" 
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="e.g. 75000"
                className={errors.monthlyIncome ? "border-red-500" : ""}
              />
              {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. State Bank of India"
                className={errors.bankName ? "border-red-500" : ""}
              />
              {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="e.g. 123456789012"
                className={errors.accountNumber ? "border-red-500" : ""}
              />
              {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <Input 
                type="text" 
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className={errors.ifscCode ? "border-red-500" : ""}
              />
              {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>Back</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleNext}>Next</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinancialInfoForm;