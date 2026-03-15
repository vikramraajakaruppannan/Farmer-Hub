// src/pages/investment/FarmingPlanForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplicationProgress from '../apply/ApplicationProgress';

const FarmingPlanForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const property = location.state?.property || { title: "Selected Land" };

  const [formData, setFormData] = useState({
    leaseDuration: '',
    startDate: '',
    plannedCrops: '',
    farmingExperience: '',
    equipment: '',
    workers: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.leaseDuration) newErrors.leaseDuration = 'Required';
    if (!formData.startDate) newErrors.startDate = 'Required';
    if (!formData.plannedCrops) newErrors.plannedCrops = 'Required';
    if (!formData.farmingExperience) newErrors.farmingExperience = 'Required';
    return newErrors;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigate('/investment/apply/financial-info', {
      state: { property, farmingPlan: formData }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-green-900 mb-8 text-center">Lease Application</h1>
        <ApplicationProgress currentStep={1} />

        <Card className="p-8 shadow-xl border-green-100">
          <h2 className="text-2xl font-semibold text-green-800 mb-8">
            Farming Plan for {property.title}
          </h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lease Duration (years) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="leaseDuration"
                  value={formData.leaseDuration}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                />
                {errors.leaseDuration && <p className="text-red-500 text-sm mt-1">{errors.leaseDuration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Planned Crops <span className="text-red-500">*</span>
              </label>
              <Input
                name="plannedCrops"
                value={formData.plannedCrops}
                onChange={handleChange}
                placeholder="e.g. Paddy, Vegetables, Sugarcane"
              />
              {errors.plannedCrops && <p className="text-red-500 text-sm mt-1">{errors.plannedCrops}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Farming Experience (years) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="farmingExperience"
                value={formData.farmingExperience}
                onChange={handleChange}
                placeholder="e.g. 5"
              />
              {errors.farmingExperience && <p className="text-red-500 text-sm mt-1">{errors.farmingExperience}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Equipment Available</label>
                <Input
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  placeholder="Tractor, Power tiller, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Workers</label>
                <Input
                  type="number"
                  name="workers"
                  value={formData.workers}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                />
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                ← Back
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleNext}>
                Continue to Financial Information →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FarmingPlanForm;