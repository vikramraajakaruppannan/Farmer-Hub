// src/components/investor/DocumentModal.jsx
import React, { useState, useEffect } from "react";
import { 
  X, CheckCircle, AlertCircle, Clock, Upload, ChevronLeft, ChevronRight,
  FileText, MapPin, Ruler, Calendar, User, ShieldCheck, Plus, Info,
  Home, DollarSign, Droplets, Leaf, Eye
} from "lucide-react";
import { api } from "@/lib/api";

// Enhanced Input Field Component
const InputField = ({ label, placeholder, value, onChange, type = "text", required = false, icon: Icon }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300`}
        required={required}
      />
    </div>
  </div>
);

// Enhanced File Upload Component
const FileUpload = ({ label, files, onFilesChange, accept = "*", required = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (newFiles) => {
    const combined = [...files, ...Array.from(newFiles)];
    const seen = new Map();
    const uniqueFiles = combined.filter(file => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
    onFilesChange(uniqueFiles);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'scale-100'}`}>
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-gray-500 mb-3">or</p>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, '-')}`}
          />
          <label
            htmlFor={`upload-${label.replace(/\s+/g, '-')}`}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Choose Files
          </label>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div 
              key={i} 
              className="group flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-sm text-gray-700 truncate font-medium">{file.name}</span>
              </div>
              <button
                onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps, steps }) => (
  <div className="mb-8">
    <div className="flex items-center gap-4 mb-6">
      {steps.map((_, i) => (
        <React.Fragment key={i}>
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10
            ${i + 1 < currentStep ? 'bg-green-600 text-white' : ''}
            ${i + 1 === currentStep ? 'bg-green-600 text-white ring-4 ring-green-100 scale-110' : ''}
            ${i + 1 > currentStep ? 'bg-gray-200 text-gray-500' : ''}
          `}>
            {i + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
    
    <div className="flex justify-between">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <step.icon className={`w-4 h-4 ${i + 1 === currentStep ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${
            i + 1 === currentStep ? 'text-green-600' : 'text-gray-500'
          }`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Review Card Component
const ReviewCard = ({ title, children, icon: Icon }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:border-green-200 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-green-700" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const DocumentModal = ({ 
  isOpen, 
  onClose, 
  title = "Property Registration", 
  mode = "add",
  property,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { label: "Basic Info", icon: Home },
    { label: "Description", icon: FileText },
    { label: "Documents", icon: Upload },
    { label: "Review", icon: Eye }
  ];

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    district: "",
    area: "",
    price: "",
    soilType: "",
    waterSource: "",
    description: "",
    boundaries: "",
  });

  const [files, setFiles] = useState({
    rtc: [],
    mutation: [],
    surveySketch: [],
    landDocuments: [],
    idProof: [],
    photos: [],
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === "edit" && property) {
      setFormData({
        title: property.title || "",
        location: property.location || "",
        district: property.district || "",
        area: property.area || "",
        price: property.price || "",
        soilType: property.soil_type || "",
        waterSource: property.water_source || "",
        description: property.description || "",
        boundaries: property.boundaries || "",
      });
    } else {
      // Reset for add mode
      setFormData({
        title: "", location: "", district: "", area: "", price: "",
        soilType: "", waterSource: "", description: "", boundaries: ""
      });
      setFiles({
        rtc: [], mutation: [], surveySketch: [], landDocuments: [], idProof: [], photos: []
      });
    }
  }, [mode, property, isOpen]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Validation
    if (!formData.title || !formData.location || !formData.district || !formData.area || !formData.price || !formData.soilType || !formData.waterSource || !formData.description) {
      alert("Please fill all required fields");
      return;
    }

    if (files.rtc.length === 0 || files.idProof.length === 0) {
      alert("Please upload RTC/Pahani and your ID Proof");
      return;
    }

    setSubmitting(true);

    const formDataToSend = new FormData();

    // Text fields
    formDataToSend.append("title", formData.title);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("district", formData.district);
    formDataToSend.append("area", parseFloat(formData.area));
    formDataToSend.append("price", parseFloat(formData.price));
    formDataToSend.append("soil_type", formData.soilType);
    formDataToSend.append("water_source", formData.waterSource);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("boundaries", formData.boundaries);

    // Files
    files.rtc.forEach(file => formDataToSend.append("rtc", file));
    files.mutation.forEach(file => formDataToSend.append("mutation", file));
    files.surveySketch.forEach(file => formDataToSend.append("survey_sketch", file));
    files.landDocuments.forEach(file => formDataToSend.append("tax_receipt", file));
    files.idProof.forEach(file => formDataToSend.append("id_proof", file));
    files.photos.forEach(file => formDataToSend.append("photos", file));

    try {
      let response;
      if (mode === "edit" && property?.id) {
        response = await api(`/properties/${property.id}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        response = await api("/properties", {
          method: "POST",
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save property");
      }

      alert(mode === "edit" 
        ? "Property updated successfully! Sent for re-verification." 
        : "Property submitted successfully! Admin will review it soon."
      );

      // Reset form
      setCurrentStep(1);
      setFormData({
        title: "", location: "", district: "", area: "", price: "",
        soilType: "", waterSource: "", description: "", boundaries: ""
      });
      setFiles({
        rtc: [], mutation: [], surveySketch: [], landDocuments: [], idProof: [], photos: []
      });

      // Safe call to onSuccess
      if (typeof onSuccess === 'function') {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to save property: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const documentStatus = [
    { key: 'rtc', label: 'RTC / Pahani', required: true },
    { key: 'mutation', label: 'Mutation Register Extract', required: false },
    { key: 'surveySketch', label: 'Survey Sketch / Akarband', required: false },
    { key: 'landDocuments', label: 'Land Tax Paid Receipt', required: false },
    { key: 'idProof', label: 'Your Aadhar / ID Proof', required: true },
    { key: 'photos', label: 'Property Photos', required: false },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative bg-gradient-to-br from-green-700 via-green-600 to-green-800 p-8 pb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {mode === "edit" ? "Edit Property" : title}
                </h2>
              </div>
              <p className="text-green-100 font-medium">Step {currentStep} of {totalSteps}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} steps={steps} />

          <div className="overflow-y-auto max-h-[50vh] pb-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Getting Started</p>
                      <p className="text-sm text-blue-700">
                        {mode === "edit" ? "Update your property details. Changes will require re-verification." : "Fill in the basic details of your property. All fields marked with * are required."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField 
                      label="Property Title" 
                      placeholder="e.g. Premium Farmland Near Hoskote" 
                      value={formData.title} 
                      onChange={handleInputChange("title")} 
                      icon={Home}
                      required 
                    />
                  </div>
                  <InputField 
                    label="Location / Village" 
                    placeholder="e.g. Hoskote" 
                    value={formData.location} 
                    onChange={handleInputChange("location")}
                    icon={MapPin}
                    required 
                  />
                  <InputField 
                    label="District" 
                    placeholder="e.g. Bangalore Rural" 
                    value={formData.district} 
                    onChange={handleInputChange("district")}
                    icon={MapPin}
                    required 
                  />
                  <InputField 
                    label="Land Area (acres)" 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g. 5.5" 
                    value={formData.area} 
                    onChange={handleInputChange("area")}
                    icon={Ruler}
                    required 
                  />
                  <InputField 
                    label="Monthly Rent (₹)" 
                    type="number" 
                    placeholder="e.g. 25000" 
                    value={formData.price} 
                    onChange={handleInputChange("price")}
                    icon={DollarSign}
                    required 
                  />
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Soil Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                      <select 
                        value={formData.soilType} 
                        onChange={handleInputChange("soilType")}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 appearance-none bg-white cursor-pointer"
                      >
                        <option value="">Select soil type</option>
                        <option>Black Soil</option>
                        <option>Red Soil</option>
                        <option>Loamy</option>
                        <option>Clay</option>
                        <option>Sandy</option>
                      </select>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Water Source <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                      <select 
                        value={formData.waterSource} 
                        onChange={handleInputChange("waterSource")}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 appearance-none bg-white cursor-pointer"
                      >
                        <option value="">Select water source</option>
                        <option>Borewell</option>
                        <option>Canal</option>
                        <option>River</option>
                        <option>Pond/Rainfed</option>
                        <option>Multiple</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Description & Boundaries */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Detailed Information</p>
                      <p className="text-sm text-amber-700">
                        Provide a comprehensive description to attract potential renters.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={handleInputChange("description")}
                    placeholder="Describe your land: soil quality, crops grown previously, accessibility, nearby facilities, infrastructure available..."
                    rows={6}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Be as detailed as possible (minimum 50 characters)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Land Boundaries
                  </label>
                  <textarea
                    value={formData.boundaries}
                    onChange={handleInputChange("boundaries")}
                    placeholder="North: Main Road\nEast: Neighbor Land\nSouth: Canal\nWest: Temple"
                    rows={5}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-300 font-mono text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Document Uploads */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900 mb-1">Document Verification</p>
                      <p className="text-sm text-purple-700">
                        Upload clear copies of your land documents. Required documents are marked with *.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    label="RTC / Pahani"
                    files={files.rtc}
                    onFilesChange={(newFiles) => setFiles(prev => ({ ...prev, rtc: newFiles }))}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <FileUpload
                    label="Mutation Register Extract"
                    files={files.mutation}
                    onFilesChange={(newFiles) => setFiles(prev => ({ ...prev, mutation: newFiles }))}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileUpload
                    label="Survey Sketch / Akarband"
                    files={files.surveySketch}
                    onFilesChange={(newFiles) => setFiles(prev => ({ ...prev, surveySketch: newFiles }))}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileUpload
                    label="Land Tax Paid Receipt"
                    files={files.landDocuments}
                    onFilesChange={(newFiles) => setFiles(prev => ({ ...prev, landDocuments: newFiles }))}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileUpload
                    label="Your Aadhar / ID Proof"
                    files={files.idProof}
                    onFilesChange={(newFiles) => setFiles(prev => ({ ...prev, idProof: newFiles }))}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <FileUpload
                    label="Property Photos"
                    files={files.photos}
                    onFilesChange={(newFiles) => setFiles(prev => ({ ...prev, photos: newFiles }))}
                    accept="image/*"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-1">Almost Done!</p>
                      <p className="text-sm text-green-700">
                        {mode === "edit" ? "Review your changes. Updated property will require re-verification." : "Review your information before submitting."}
                      </p>
                    </div>
                  </div>
                </div>

                <ReviewCard title="Basic Information" icon={Home}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Title</p>
                      <p className="font-semibold text-gray-800">{formData.title || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Area</p>
                      <p className="font-semibold text-gray-800">{formData.area ? `${formData.area} acres` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-800">{formData.location && formData.district ? `${formData.location}, ${formData.district}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Monthly Rent</p>
                      <p className="font-semibold text-gray-800">{formData.price ? `₹${formData.price}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Soil Type</p>
                      <p className="font-semibold text-gray-800">{formData.soilType || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Water Source</p>
                      <p className="font-semibold text-gray-800">{formData.waterSource || "-"}</p>
                    </div>
                  </div>
                </ReviewCard>

                <ReviewCard title="Description" icon={FileText}>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {formData.description || "No description provided"}
                  </p>
                  {formData.boundaries && (
                    <div className="mt-4">
                      <p className="text-gray-500 text-sm mb-1">Boundaries</p>
                      <pre className="text-sm bg-gray-50 p-3 rounded-lg font-mono whitespace-pre-wrap">
                        {formData.boundaries}
                      </pre>
                    </div>
                  )}
                </ReviewCard>

                <ReviewCard title="Documents Uploaded" icon={Upload}>
                  <div className="space-y-3 text-sm">
                    {documentStatus.map(({ key, label, required }) => {
                      const count = files[key].length;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {count > 0 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className={`w-4 h-4 ${required ? 'text-red-500' : 'text-gray-400'}`} />
                            )}
                            <span className={`${count === 0 && required ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                              {label}: {count > 0 ? `${count} file(s)` : 'Not uploaded'}
                            </span>
                          </div>
                          {required && count === 0 && <span className="text-xs text-red-500 font-medium">Required</span>}
                        </div>
                      );
                    })}
                  </div>
                </ReviewCard>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">What happens next?</p>
                      <p className="text-sm text-amber-700">
                        {mode === "edit" 
                          ? "Your updated property will be sent for re-verification. It may take 3-5 days." 
                          : "Your property and documents will be reviewed by our admin team. Verification typically takes 3-5 business days."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>

                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105"
                  >
                    Next Step
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="group flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {mode === "edit" ? "Update & Re-verify" : "Submit for Verification"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;