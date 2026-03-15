// src/pages/DocumentReview.jsx
import React, { useState, useEffect } from "react";
import { 
  Search, Clock, CheckCircle, XCircle, Shield, Home, Users, 
  ChevronRight, X, FileText, Phone, Calendar, DollarSign, MapPin
} from "lucide-react";

import Navbar from "@/components/investor/Navbar";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Review Request Card Component
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
                {request.profiles?.first_name?.[0] || "?"}
              </div>
              {request.profiles && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {request.profiles?.first_name || "Unknown Farmer"}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Phone className="w-4 h-4" />
                {request.profiles?.mobile || "No phone"}
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
            <span className="font-semibold text-green-800">
              {request.properties?.title || "Unknown Property"}
            </span>
          </div>
          <p className="text-sm text-gray-700 flex items-center gap-2 ml-8">
            <MapPin className="w-4 h-4 text-gray-500" />
            {request.properties?.location || "N/A"}
          </p>
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">PROPOSED RENT</p>
            <p className="text-xl font-bold text-blue-900">
              ₹{request.proposed_rent?.toLocaleString() || "—"}/month
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-1">DURATION</p>
            <p className="text-xl font-bold text-purple-900">
              {request.lease_duration_years || "—"} years
            </p>
          </div>
        </div>

        {/* Document Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Documents Submitted
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
const DetailedReviewModal = ({ isOpen, onClose, request, onAccept, onReject }) => {
  if (!isOpen || !request) return null;

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
          <p className="text-white/90 mt-2">Property: {request.properties?.title || "—"}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Farmer Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {request.profiles?.first_name?.[0] || "?"}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {request.profiles?.first_name || "Unknown Farmer"}
                </h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="w-5 h-5" /> {request.profiles?.mobile || "No phone"}
                </p>
              </div>
            </div>
          </div>

          {/* Proposal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 text-center">
              <DollarSign className="w-10 h-10 text-green-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-green-700">Proposed Rent</p>
              <p className="text-3xl font-bold text-green-800 mt-2">
                ₹{request.proposed_rent?.toLocaleString() || "—"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 text-center">
              <Calendar className="w-10 h-10 text-purple-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-purple-700">Duration</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">
                {request.lease_duration_years || "—"} years
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 text-center">
              <Users className="w-10 h-10 text-amber-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-amber-700">Applied On</p>
              <p className="text-2xl font-bold text-amber-800 mt-2">
                {new Date(request.created_at).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Message */}
          {request.message_to_owner && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3">Message from Farmer</h4>
              <p className="text-gray-700 leading-relaxed italic">"{request.message_to_owner}"</p>
            </div>
          )}

          {/* Documents */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-cyan-700" />
              Submitted Documents
            </h4>
            <div className="space-y-3">
              {request.id_proof_url && (
                <a href={request.id_proof_url} target="_blank" rel="noopener noreferrer" className="block text-green-700 hover:underline">
                  ID Proof
                </a>
              )}
              {request.income_proof_url && (
                <a href={request.income_proof_url} target="_blank" rel="noopener noreferrer" className="block text-green-700 hover:underline">
                  Income Proof
                </a>
              )}
              {request.bank_statement_url && (
                <a href={request.bank_statement_url} target="_blank" rel="noopener noreferrer" className="block text-green-700 hover:underline">
                  Bank Statement
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
            <button
              onClick={() => onAccept(request.id)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <CheckCircle className="w-6 h-6" />
              Accept Request
            </button>
            <button
              onClick={() => onReject(request.id)}
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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/properties/investor/pending-applications");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load farmer requests. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load pending applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const filtered = requests.filter(req =>
    (req.profiles?.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.properties?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.properties?.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAccept = async (id) => {
    try {
      await api(`/properties/applications/${id}/investor-accept`, { method: "PATCH" });
      toast({ title: "Accepted", description: "Request accepted successfully" });
      fetchPendingRequests();
      setModalOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    
    try {
      await api(`/properties/applications/${id}/investor-reject`, { method: "PATCH" });
      toast({ title: "Rejected", description: "Request rejected successfully" });
      fetchPendingRequests();
      setModalOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    }
  };

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
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading farmer requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600 font-medium">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800">No Pending Requests</h3>
              <p className="text-gray-600 mt-2">All applications have been reviewed.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};

export default DocumentReview;