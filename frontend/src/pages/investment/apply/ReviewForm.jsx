import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Loader2 } from 'lucide-react';
import { ApplicationProgress } from './PropertyDetailsForm';
import { toast } from '../../../components/ui/use-toast';

const ReviewForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleBack = () => {
    navigate('/investment/apply/documents');
  };

  const handleSubmit = () => {
    if (!isChecked) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/investment/apply/success');
      toast({
        title: "Success",
        description: "Application submitted successfully!"
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-4 text-center text-green-800">Investment Application</h1>
        <ApplicationProgress currentStep={4} />

        <Card className="p-4 shadow-lg border border-green-100 bg-white/90">
          <h2 className="text-lg font-medium mb-4">Review Application</h2>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-medium text-gray-800 mb-1">Property Information</h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <p className="text-gray-500">Property Name</p>
                  <p>Premium Farmland</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p>North Bangalore</p>
                </div>
                <div>
                  <p className="text-gray-500">Investment/Year</p>
                  <p>₹25,000</p>
                </div>
                <div>
                  <p className="text-gray-500">Area</p>
                  <p>3.2 acres</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-2">
              <h3 className="font-medium text-gray-800 mb-1">Farming Plan</h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <p className="text-gray-500">Lease Duration</p>
                  <p>2 years</p>
                </div>
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p>01/01/2024</p>
                </div>
                <div>
                  <p className="text-gray-500">Planned Crops</p>
                  <p>Rice, Wheat</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-2">
              <h3 className="font-medium text-gray-800 mb-1">Financial Information</h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <p className="text-gray-500">Investment Budget</p>
                  <p>₹5,00,000</p>
                </div>
                <div>
                  <p className="text-gray-500">Monthly Income</p>
                  <p>₹75,000</p>
                </div>
                <div>
                  <p className="text-gray-500">Bank Details</p>
                  <p>XXXX Bank</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-1">Uploaded Documents</h3>
              <div className="space-y-1 text-xs">
                <p>✓ ID Proof</p>
                <p>✓ Income Proof</p>
                <p>✓ Bank Statement</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-1"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <span className="text-xs">
                I certify that all the information provided is correct and I agree to the terms and conditions.
              </span>
            </label>
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSubmit}
              disabled={!isChecked || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReviewForm;