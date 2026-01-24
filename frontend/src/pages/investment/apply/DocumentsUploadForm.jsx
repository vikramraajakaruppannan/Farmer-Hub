import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { File, Upload, X } from 'lucide-react';
import { ApplicationProgress } from './PropertyDetailsForm';
import { toast } from '../../../components/ui/use-toast';

const DocumentUploadTile = ({ 
  type, 
  title, 
  description, 
  required = true,
  onFileSelect,
  onFileRemove,
  file 
}) => (
  <div className="border rounded-lg p-2 mb-2">
    <h3 className="text-base font-medium mb-1">
      {title} {required && <span className="text-red-500">*</span>}
    </h3>
    
    {file ? (
      <div className="flex items-center justify-between bg-gray-50 p-1 rounded-md">
        <div className="flex items-center">
          <File className="h-3 w-3 text-gray-500 mr-1" />
          <span className="text-xs truncate max-w-[150px]">{file.name}</span>
          <span className="text-xs text-gray-500 ml-1">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <button 
          onClick={() => onFileRemove(type)}
          className="text-gray-500 hover:text-red-500"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    ) : (
      <div 
        className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:border-green-500 transition-colors"
        onClick={() => document.getElementById(type)?.click()}
      >
        <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
        <p className="text-xs text-gray-600">{description}</p>
        <input
          id={type}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileSelect(type, e.target.files[0]);
            }
          }}
        />
      </div>
    )}
  </div>
);

const DocumentsUploadForm = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({
    idProof: null,
    incomeProof: null,
    bankStatement: null,
    farmingCertificate: null
  });

  const handleFileUpload = (type, file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const removeFile = (type) => {
    setDocuments(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const handleNext = () => {
    const requiredDocs = ['idProof', 'incomeProof', 'bankStatement'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);

    if (missingDocs.length > 0) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/investment/apply/review');
  };

  const handleBack = () => {
    navigate('/investment/apply/financial-info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-4 text-center text-green-800">Investment Application</h1>
        <ApplicationProgress currentStep={3} />
        
        <Card className="p-4 shadow-lg border border-green-100 bg-white/90">
          <h2 className="text-lg font-medium mb-4">Upload Documents</h2>
          
          <DocumentUploadTile
            type="idProof"
            title="ID Proof"
            description="Upload Aadhaar/PAN Card (PDF or image file)"
            onFileSelect={handleFileUpload}
            onFileRemove={removeFile}
            file={documents.idProof}
          />
          
          <DocumentUploadTile
            type="incomeProof"
            title="Income Proof"
            description="Upload ITR/Salary Slip (PDF or image file)"
            onFileSelect={handleFileUpload}
            onFileRemove={removeFile}
            file={documents.incomeProof}
          />
          
          <DocumentUploadTile
            type="bankStatement"
            title="Bank Statement"
            description="Upload last 6 months statement (PDF file only)"
            onFileSelect={handleFileUpload}
            onFileRemove={removeFile}
            file={documents.bankStatement}
          />
          
          <DocumentUploadTile
            type="farmingCertificate"
            title="Farming Experience Certificate"
            description="Upload if available (Optional)"
            required={false}
            onFileSelect={handleFileUpload}
            onFileRemove={removeFile}
            file={documents.farmingCertificate}
          />
          
          <div className="flex justify-between mt-6">
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

export default DocumentsUploadForm;