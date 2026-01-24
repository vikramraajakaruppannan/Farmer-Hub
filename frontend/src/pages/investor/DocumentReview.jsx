// src/pages/DocumentReview.jsx
import React, { useState } from "react";
import { 
  Search, Filter, MapPin, User, Phone, Calendar, 
  DollarSign, FileText, Clock, CheckCircle, XCircle,
  Shield, Home, Users, ChevronRight, X
} from "lucide-react";

import Navbar from "@/components/investor/Navbar";

// Review Request Card
const ReviewRequestCard = ({ request, onViewDetails }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onViewDetails}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {request.farmerName[0]}
              </div>
              {request.farmerVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{request.farmerName}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Phone className="w-4 h-4" />
                {request.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              <Clock className="w-4 h-4" />
              Pending Review
            </span>
          </div>
        </div>

        {/* Property Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-5 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Home className="w-5 h-5 text-green-700" />
            <span className="font-semibold text-green-800">{request.propertyTitle}</span>
          </div>
          <p className="text-sm text-gray-700 flex items-center gap-2 ml-8">
            <MapPin className="w-4 h-4 text-gray-500" />
            {request.propertyLocation}
          </p>
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">PROPOSED RENT</p>
            <p className="text-xl font-bold text-blue-900">₹{request.proposedRent}/month</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-1">DURATION</p>
            <p className="text-xl font-bold text-purple-900">{request.duration}</p>
          </div>
        </div>

        {/* Document Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {request.documentsSubmitted} documents submitted
            </span>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            Review Now
            <ChevronRight className={`w-5 h-5 transition-transform ${hovered ? 'translate-x-1' : ''}`} />
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-green-600 via-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
};

// Detailed Review Modal
const DetailedReviewModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const handleAccept = () => {
    alert(`Request from ${request.farmerName} has been ACCEPTED. Admin will finalize the agreement.`);
    onClose();
  };

  const handleReject = () => {
    if (window.confirm(`Reject request from ${request.farmerName}?`)) {
      alert("Request rejected.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-br from-green-700 to-green-800 p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-white">Review Farmer Request</h2>
          <p className="text-white/90 mt-2">Property: {request.propertyTitle}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Farmer Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {request.farmerName[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{request.farmerName}</h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="w-5 h-5" /> {request.phone}
                </p>
                {request.farmerVerified && (
                  <p className="text-green-700 font-semibold flex items-center gap-2 mt-2">
                    <Shield className="w-5 h-5" /> Identity Verified
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Proposal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 text-center">
              <DollarSign className="w-10 h-10 text-green-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-green-700">Proposed Rent</p>
              <p className="text-3xl font-bold text-green-800 mt-2">₹{request.proposedRent}<span className="text-lg font-normal">/mo</span></p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 text-center">
              <Calendar className="w-10 h-10 text-purple-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-purple-700">Lease Duration</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{request.duration}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 text-center">
              <Users className="w-10 h-10 text-amber-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-amber-700">Applied On</p>
              <p className="text-2xl font-bold text-amber-800 mt-2">{request.appliedDate}</p>
            </div>
          </div>

          {/* Farmer Message */}
          {request.message && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3">Message from Farmer</h4>
              <p className="text-gray-700 leading-relaxed italic">"{request.message}"</p>
            </div>
          )}

          {/* Documents Submitted */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-cyan-700" />
              Submitted Documents ({request.documentsSubmitted})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Aadhar Card", "Farmer ID", "Bank Passbook", "Experience Certificate", "Crop Plan"].map((doc, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-cyan-100 flex items-center justify-between hover:shadow-md transition">
                  <span className="text-sm font-medium text-gray-800">{doc}</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition">
              View All Documents
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <CheckCircle className="w-6 h-6" />
              Accept Request
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-red-300 text-red-600 rounded-xl font-bold text-lg hover:bg-red-50 hover:border-red-400 transition-all duration-300"
            >
              <XCircle className="w-6 h-6" />
              Reject Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Document Review Page
const DocumentReview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Mock pending requests
  const pendingRequests = [
    {
      id: 1,
      farmerName: "Ramesh Gowda",
      phone: "+91 98765 43210",
      farmerVerified: true,
      propertyTitle: "Premium Black Soil Farmland",
      propertyLocation: "Hoskote, Bangalore Rural",
      proposedRent: "24,000",
      duration: "3 years",
      appliedDate: "28 Dec 2025",
      documentsSubmitted: 5,
      message: "I have 15+ years experience in organic farming and would maintain your land sustainably with paddy and vegetables."
    },
    {
      id: 2,
      farmerName: "Kumar Swamy",
      phone: "+91 87654 32109",
      farmerVerified: true,
      propertyTitle: "Riverside Organic Plot",
      propertyLocation: "Mandya, Karnataka",
      proposedRent: "34,000",
      duration: "2 years",
      appliedDate: "30 Dec 2025",
      documentsSubmitted: 4,
      message: "Interested in your riverside land for integrated farming. I have experience with aquaculture + crops."
    },
    {
      id: 3,
      farmerName: "Anand Patil",
      phone: "+91 76543 21098",
      farmerVerified: false,
      propertyTitle: "Premium Black Soil Farmland",
      propertyLocation: "Hoskote, Bangalore Rural",
      proposedRent: "23,500",
      duration: "4 years",
      appliedDate: "01 Jan 2026",
      documentsSubmitted: 3,
    },
  ];

  const filtered = pendingRequests.filter(req =>
    req.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.propertyLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openReview = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-white">
      <Navbar profileClick={() => {}} />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-800 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Document Review Center
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-4xl mx-auto">
            Review farmer applications, verify documents, and select the best tenant for your land
          </p>

          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-7 h-7" />
            <input
              type="text"
              placeholder="Search by farmer name, property, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="container mx-auto px-4 py-12 max-w-7xl -mt-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Pending Requests</h2>
              <p className="text-gray-600 mt-2">{pendingRequests.length} applications awaiting review</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-amber-600">{pendingRequests.length}</span>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Users className="w-14 h-14 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No Pending Reviews</h3>
              <p className="text-xl text-gray-600">Great job! All farmer requests have been reviewed.</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {filtered.map((request) => (
                <ReviewRequestCard
                  key={request.id}
                  request={request}
                  onViewDetails={() => openReview(request)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Review Modal */}
      <DetailedReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};

export default DocumentReview;