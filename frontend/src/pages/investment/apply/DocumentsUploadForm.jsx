// src/pages/investment/DocumentsUploadForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { File, Upload, X } from 'lucide-react';
import ApplicationProgress from '../apply/ApplicationProgress';
import { toast } from '@/components/ui/use-toast';

const DocumentUploadTile = ({ type, title, description, required = true, onFileSelect, onFileRemove, file }) => (
  <div className="border rounded-lg p-3 mb-3 bg-white">
    <h3 className="text-base font-medium mb-2">
      {title} {required && <span className="text-red-500">*</span>}
    </h3>
    
    {file ? (
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-gray-600" />
          <span className="text-sm truncate max-w-[180px]">{file.name}</span>
          <span className="text-xs text-gray-500">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <button onClick={() => onFileRemove(type)} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <div 
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors"
        onClick={() => document.getElementById(type)?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">{description}</p>
        <input
          id={type}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files?.[0]) onFileSelect(type, e.target.files[0]);
          }}
        />
      </div>
    )}
  </div>
);

const DocumentsUploadForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { property, farmingPlan, financialInfo } = location.state || {};

  const [documents, setDocuments] = useState({
    idProof: null,
    incomeProof: null,
    bankStatement: null,
    farmingCertificate: null
  });

  const handleFileUpload = (type, file) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "File too large", description: "Max size: 5MB", variant: "destructive" });
      return;
    }
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleFileRemove = (type) => {
    setDocuments(prev => ({ ...prev, [type]: null }));
  };

  const handleNext = () => {
    if (!documents.idProof || !documents.incomeProof || !documents.bankStatement) {
      toast({
        title: "Missing Documents",
        description: "ID Proof, Income Proof, and Bank Statement are required.",
        variant: "destructive"
      });
      return;
    }

    navigate('/investment/apply/review', {
      state: {
        property,
        farmingPlan,
        financialInfo,
        documents
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-green-800">Lease Application</h1>
        <ApplicationProgress currentStep={3} />

        <Card className="p-8 shadow-xl border-green-100">
          <h2 className="text-2xl font-semibold text-green-800 mb-8">Upload Required Documents</h2>

          <div className="space-y-6">
            <DocumentUploadTile
              type="idProof"
              title="ID Proof (Aadhaar/PAN)"
              description="Upload clear PDF or image (max 5MB)"
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              file={documents.idProof}
            />

            <DocumentUploadTile
              type="incomeProof"
              title="Income Proof (ITR/Salary Slip)"
              description="Upload latest PDF or image (max 5MB)"
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              file={documents.incomeProof}
            />

            <DocumentUploadTile
              type="bankStatement"
              title="Bank Statement (last 6 months)"
              description="Upload PDF only (max 5MB)"
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              file={documents.bankStatement}
            />

            <DocumentUploadTile
              type="farmingCertificate"
              title="Farming Experience Certificate (Optional)"
              description="Upload if available"
              required={false}
              onFileSelect={handleFileUpload}
              onFileRemove={handleFileRemove}
              file={documents.farmingCertificate}
            />

            <div className="pt-8 flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                ← Back
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleNext}>
                Continue to Review →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DocumentsUploadForm;