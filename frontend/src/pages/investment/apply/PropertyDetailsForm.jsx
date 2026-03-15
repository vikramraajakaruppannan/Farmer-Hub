// src/pages/investment/PropertyDetailsForm.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplicationProgress from '../apply/ApplicationProgress';

const PropertyDetailsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const property = location.state?.property || {
    title: "Unknown Land",
    location: "N/A",
    price: "N/A",
    area: "N/A",
    district: "N/A"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-green-900 mb-8 text-center">Lease Application</h1>
        
        <ApplicationProgress currentStep={0} />

        <Card className="p-8 shadow-xl border-green-100">
          <h2 className="text-2xl font-semibold text-green-800 mb-8">
            Step 1 – Property Details
          </h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
                <Input value={property.title} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input value={property.location} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <Input value={property.district || "N/A"} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                <Input value={`${property.area} acres`} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rent per acre / year</label>
                <Input value={`₹${property.price?.toLocaleString() || "N/A"}`} readOnly className="bg-gray-50" />
              </div>
            </div>

            <div className="pt-8 border-t flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => navigate(-1)}
              >
                ← Back to Property
              </Button>
              
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                onClick={() => navigate('/investment/apply/farming-plan', { state: { property } })}
              >
                Continue to Farming Plan →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PropertyDetailsForm;