// src/pages/investment/ReviewForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2 } from 'lucide-react';
import ApplicationProgress from '../apply/ApplicationProgress';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const ReviewForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Receive all data from previous steps
  const { property = {}, farmingPlan = {}, financialInfo = {}, documents = {} } = location.state || {};

  const handleSubmit = async () => {
    if (!isChecked) {
      toast({ title: "Error", description: "Please accept the terms", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Basic fields
      formData.append("property_id", property.id);
      formData.append("proposed_rent", property.price);
      formData.append("lease_duration_years", farmingPlan.leaseDuration);
      formData.append("start_date", farmingPlan.startDate);
      formData.append("planned_crops", farmingPlan.plannedCrops);
      formData.append("farming_experience_years", farmingPlan.farmingExperience);
      formData.append("equipment", farmingPlan.equipment);
      formData.append("workers_count", farmingPlan.workers);
      formData.append("investment_budget", financialInfo.investmentBudget);
      formData.append("monthly_income", financialInfo.monthlyIncome);
      formData.append("bank_name", financialInfo.bankName);
      formData.append("account_number", financialInfo.accountNumber);
      formData.append("ifsc_code", financialInfo.ifscCode);
      formData.append("message_to_owner", "Interested in leasing this land for farming purposes.");

      // Files
      if (documents.idProof) formData.append("id_proof", documents.idProof);
      if (documents.incomeProof) formData.append("income_proof", documents.incomeProof);
      if (documents.bankStatement) formData.append("bank_statement", documents.bankStatement);
      if (documents.farmingCertificate) formData.append("farming_certificate", documents.farmingCertificate);

      const res = await api("/farmer/lease-applications", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header — browser sets it automatically for FormData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Submission failed");
      }

      navigate('/investment/apply/success');
      toast({ title: "Success", description: "Application submitted successfully!" });
    } catch (err) {
      console.error("Submission error:", err);
      toast({
        title: "Submission Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-800">Review Your Application</h1>
        <ApplicationProgress currentStep={4} />

        <Card className="p-8 shadow-xl border-green-100">
          <div className="space-y-8">
            {/* Property */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-800">Property Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Property Name:</strong> {property.title || "N/A"}</div>
                <div><strong>Location:</strong> {property.location || "N/A"}</div>
                <div><strong>Rent:</strong> ₹{property.price || "N/A"}</div>
                <div><strong>Area:</strong> {property.area || "N/A"} acres</div>
              </div>
            </div>

            {/* Farming Plan */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-800">Farming Plan</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Duration:</strong> {farmingPlan.leaseDuration || "N/A"} years</div>
                <div><strong>Start Date:</strong> {farmingPlan.startDate || "N/A"}</div>
                <div><strong>Planned Crops:</strong> {farmingPlan.plannedCrops || "N/A"}</div>
                <div><strong>Experience:</strong> {farmingPlan.farmingExperience || "N/A"} years</div>
                <div><strong>Equipment:</strong> {farmingPlan.equipment || "N/A"}</div>
                <div><strong>Workers:</strong> {farmingPlan.workers || "N/A"}</div>
              </div>
            </div>

            {/* Financial */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-800">Financial Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Budget:</strong> ₹{financialInfo.investmentBudget || "N/A"}</div>
                <div><strong>Monthly Income:</strong> ₹{financialInfo.monthlyIncome || "N/A"}</div>
                <div><strong>Bank:</strong> {financialInfo.bankName || "N/A"}</div>
                <div><strong>Account:</strong> {financialInfo.accountNumber || "N/A"}</div>
                <div><strong>IFSC:</strong> {financialInfo.ifscCode || "N/A"}</div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-800">Uploaded Documents</h3>
              <div className="space-y-2 text-sm">
                {documents.idProof && <p>✓ ID Proof ({documents.idProof.name})</p>}
                {documents.incomeProof && <p>✓ Income Proof ({documents.incomeProof.name})</p>}
                {documents.bankStatement && <p>✓ Bank Statement ({documents.bankStatement.name})</p>}
                {documents.farmingCertificate && <p>✓ Farming Certificate ({documents.farmingCertificate.name})</p>}
                {!Object.keys(documents).length && <p className="text-gray-500">No documents uploaded</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={e => setIsChecked(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                I certify that all the information provided is correct and I agree to the terms and conditions.
              </span>
            </label>
          </div>

          <div className="flex justify-between mt-10">
            <Button variant="outline" className="flex-1 mr-4" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={!isChecked || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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