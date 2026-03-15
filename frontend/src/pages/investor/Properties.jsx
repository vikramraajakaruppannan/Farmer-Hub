// src/pages/Properties.jsx
import React, { useState, useEffect } from "react";
import { 
  MapPin, Layers, DollarSign, Clock, CheckCircle, Shield, XCircle,
  Search, Home, Users, ChevronRight, X, Eye, Edit, Trash2,
  FileText, Image, Award, Phone, Calendar, Info, AlertCircle, Leaf 
} from "lucide-react";
import Navbar from "@/components/investor/Navbar";
import DocumentModal from "@/components/investor/DocumentModal";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

const FarmerRequestCard = ({ request, onAccept, onReject }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";

  return (
    <div className={`group bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all duration-300 ${
      isApproved 
        ? "border-green-200 bg-green-50/50 hover:bg-green-100" 
        : isPending 
          ? "border-amber-200 hover:border-amber-300 hover:shadow-xl" 
          : "border-gray-200 opacity-75"
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {request.profiles?.first_name?.[0] || "?"}
              </div>
              {request.profiles && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-800">
                {request.profiles?.first_name || "Unknown Farmer"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600 font-medium">
                  {request.profiles?.email || "Unknown Email"}
                </span>
              </div>
            </div>
          </div>

          <span className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm ${
            isPending ? "bg-amber-100 text-amber-800 border border-amber-200" :
            isApproved ? "bg-green-100 text-green-800 border border-green-200" :
            "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {isPending ? "Pending" : isApproved ? "Approved" : "Rejected"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <Phone className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {request.profiles?.mobile || "No phone"}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {new Date(request.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">PROPOSED RENT</p>
              <p className="text-2xl font-bold text-green-800">
                ₹{request.proposed_rent?.toLocaleString() || "—"}/month
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-green-700 mb-1">DURATION</p>
              <p className="text-lg font-bold text-green-800">
                {request.lease_duration_years || "—"} years
              </p>
            </div>
          </div>
        </div>

        {request.message_to_owner && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="w-full text-left mb-4 hover:text-gray-800"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 transition-colors">
              <span className="font-medium">View message from farmer</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
            {isExpanded && (
              <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">{request.message_to_owner}</p>
              </div>
            )}
          </button>
        )}

        {isPending && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onAccept(request.id)}
              className="group flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105"
            >
              <CheckCircle className="w-5 h-5" />
              Accept Request
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="py-3 px-6 bg-white border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
          </div>
        )}

        {isApproved && (
          <div className="mt-4 py-3 px-6 bg-green-100 text-green-800 rounded-xl text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Request Accepted - Admin will finalize agreement
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyCard = ({ property, onClick }) => {
  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-green-200 hover:-translate-y-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-52 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute top-4 right-4 z-10">
          {property.status === "verified" ? (
            <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-green-600 text-white">
              <Shield className="w-4 h-4" />
              Verified
            </span>
          ) : property.status === "rejected" ? (
            <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-red-600 text-white">
              <XCircle className="w-4 h-4" />
              Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-amber-500 text-white">
              <Clock className="w-4 h-4" />
              Pending
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-bold text-xl mb-2 line-clamp-1 group-hover:text-green-200 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{property.location}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-green-700" />
              <p className="text-xs font-semibold text-green-700">AREA</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{property.area} acres</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-700" />
              <p className="text-xs font-semibold text-blue-700">RENT</p>
            </div>
            <p className="text-lg font-bold text-gray-800">₹{property.price}/mo</p>
          </div>
        </div>

        {property.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-800">This property was rejected by admin</p>
            <p className="text-xs text-red-600 mt-1">You can edit and resubmit for verification</p>
          </div>
        )}

        <button className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105 group">
          View Details
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
};

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api("/properties");
      if (!response.ok) throw new Error("Failed to load properties");
      const data = await response.json();
      setProperties(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your properties. Please try again.");
      toast({
        title: "Error",
        description: "Could not load properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filtered = properties.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetails = (property) => {
    setSelectedProperty(property);
    setDetailModalOpen(true);
  };

  const openEdit = (property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
    setDetailModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    fetchProperties();
  };

  const handleEditSuccess = () => {
    fetchProperties();
    setEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-white">
      <Navbar profileClick={() => {}} />

      <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            My Properties
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            View details, manage farmer requests, and edit your land portfolio
          </p>

          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-7 h-7" />
            <input
              type="text"
              placeholder="Search your properties by title, location, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl -mt-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading your properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-xl text-red-600 mb-4">{error}</p>
              <button onClick={fetchProperties} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Home className="w-14 h-14 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No Properties Yet</h3>
              <p className="text-xl text-gray-600">Register your first land from the home page to begin earning.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => openDetails(property)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PropertyDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        property={selectedProperty}
        onEdit={() => openEdit(selectedProperty)}
        onDelete={handleDeleteSuccess}
      />

      <DocumentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Property"
        mode="edit"
        property={selectedProperty}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

const PropertyDetailModal = ({ isOpen, onClose, property, onEdit, onDelete }) => {
  if (!isOpen || !property) return null;

  const [activeTab, setActiveTab] = useState("details");
  const [requestTab, setRequestTab] = useState("pending");
  const [farmerRequests, setFarmerRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    if (isOpen && property?.id) {
      fetchFarmerRequests();
    }
  }, [isOpen, property?.id]);

  const fetchFarmerRequests = async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const res = await api(`/properties/${property.id}/approved-requests`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load requests");
      }
      const data = await res.json();
      setFarmerRequests(data || []);
    } catch (err) {
      console.error(err);
      setRequestsError("Failed to load farmer requests");
      toast({
        title: "Error",
        description: err.message || "Could not load farmer requests",
        variant: "destructive"
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  const pendingRequests = farmerRequests.filter(r => r.status === "pending");
  const approvedRequests = farmerRequests.filter(r => r.status === "approved");
  const hasConfirmedFarmer = approvedRequests.length > 0;

  const handleAccept = async (id) => {
    if (!window.confirm("Accept this farmer request?")) return;
    
    try {
      const res = await api(`/applications/${id}/investor-accept`, { method: "PATCH" });
      if (!res.ok) throw new Error("Accept failed");
      toast({ title: "Success", description: "Request accepted" });
      fetchFarmerRequests();
    } catch (err) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this farmer request?")) return;
    
    try {
      const res = await api(`/applications/${id}/investor-reject`, { method: "PATCH" });
      if (!res.ok) throw new Error("Reject failed");
      toast({ title: "Success", description: "Request rejected" });
      fetchFarmerRequests();
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (hasConfirmedFarmer) {
      alert("Cannot delete: This property has an accepted farmer request.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      try {
        const res = await api(`/properties/${property.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast({ title: "Success", description: "Property deleted" });
        onDelete();
        onClose();
      } catch {
        toast({ title: "Error", description: "Failed to delete property", variant: "destructive" });
      }
    }
  };

  const getFileName = (url) => {
    try {
      return decodeURIComponent(url.split('/').pop().split('?')[0]);
    } catch {
      return "Document";
    }
  };

  const getFileIcon = (url) => {
    const ext = url.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-red-600" />;
  };

  const handleRequestChange = async () => {
    const reason = prompt("Why do you want to edit or delete this property?\nPlease explain clearly:");
    if (!reason?.trim()) return;

    const isEdit = window.confirm("OK = Edit Request\nCancel = Delete Request");
    const type = isEdit ? "edit" : "delete";

    try {
      const res = await api(`/properties/${property.id}/request-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, reason: reason.trim() })
      });

      if (!res.ok) throw new Error("Request failed");
      toast({ title: "Success", description: "Change request sent to admin" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to send request", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="relative bg-gradient-to-br from-green-700 via-green-600 to-green-800 p-8">
          <button onClick={onClose} className="absolute top-0 right-0 text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 hover:rotate-90">
            <X className="w-6 h-6" />
          </button>

          <div className="pr-12">
            <div className="flex items-center gap-3 mb-3">
              {property.status === "verified" ? (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Verified Property</span>
                </div>
              ) : property.status === "rejected" ? (
                <div className="flex items-center gap-2 bg-red-600/30 backdrop-blur-sm px-4 py-2 rounded-full border border-red-300/30">
                  <XCircle className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Rejected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-300/30">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Pending Verification</span>
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{property.title}</h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{property.location}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b-2 border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab("details")} 
            className={`relative flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
              activeTab === "details" ? "text-green-700 bg-white" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Property Details
            </div>
            {activeTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-700 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("requests")} 
            className={`relative flex-1 py-4 px-6 font-semibold transition-all duration-200 ${
              activeTab === "requests" ? "text-green-700 bg-white" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Farmer Requests ({farmerRequests.length})
            </div>
            {activeTab === "requests" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-700 rounded-t-full" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "details" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Layers, label: "Area", value: `${property.area} acres`, color: "green" },
                  { icon: DollarSign, label: "Monthly Rent", value: `₹${property.price}`, color: "blue" },
                  { icon: Leaf, label: "Soil Type", value: property.soil_type, color: "amber" },
                  { icon: FileText, label: "Water Source", value: property.water_source, color: "purple" },
                ].map((stat, i) => (
                  <div key={i} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-md">
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-700`} />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  </div>
                ))}
              </div>

              {property.description && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border-2 border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-700" />
                    Property Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Land Documents</h3>
                      <p className="text-sm text-gray-600">All uploaded documents for this property</p>
                    </div>
                  </div>
                  <div className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                    {property.document_urls?.length || 0} File{property.document_urls?.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {(!property.document_urls || property.document_urls.length === 0) ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {property.document_urls.map((url, index) => (
                      <div key={index} className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                            {getFileIcon(url)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 truncate max-w-md">{getFileName(url)}</p>
                            <p className="text-xs text-gray-500">Document {index + 1}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(url, '_blank')}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                {property.status === "verified" ? (
                  property.change_status === "approved" ? (
                    <>
                      <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Edit className="w-5 h-5" />
                        Edit Property (Approved)
                      </button>
                      <div className="flex-1 bg-green-100 border-2 border-green-300 rounded-xl p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-green-800 font-bold text-lg">Admin Approved Your Edit!</p>
                        <p className="text-sm text-green-700 mt-2">After editing, property will go for re-verification.</p>
                      </div>
                    </>
                  ) : property.change_status === "pending" ? (
                    <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center">
                      <Clock className="w-16 h-16 text-amber-600 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-amber-900 mb-4">Change Request Pending</h3>
                      <p className="text-lg text-gray-700">Your edit/delete request is awaiting admin review...</p>
                    </div>
                  ) : property.change_status === "rejected" ? (
                    <div className="w-full bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center">
                      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-red-900 mb-4">Change Request Rejected</h3>
                      <p className="text-lg text-gray-700 mb-6">
                        Admin rejected your previous request.<br />
                        You can submit a new request if needed.
                      </p>
                      <button 
                        onClick={handleRequestChange}
                        className="px-12 py-5 bg-red-600 text-white text-xl rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        Request Again
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-2xl p-8 text-center">
                      <Shield className="w-16 h-16 text-purple-600 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">Verified Property</h3>
                      <p className="text-lg text-gray-700 mb-8">
                        You cannot edit or delete directly.<br />
                        Request admin permission first.
                      </p>
                      <button 
                        onClick={handleRequestChange}
                        className="px-12 py-5 bg-purple-600 text-white text-xl rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        Request Permission
                      </button>
                    </div>
                  )
                ) : property.status === "rejected" ? (
                  <>
                    <button
                      onClick={onEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:scale-105"
                    >
                      <Edit className="w-5 h-5" />
                      Edit & Resubmit
                    </button>
                    <div className="flex-1 bg-red-100 border-2 border-red-300 rounded-xl p-6 text-center">
                      <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                      <p className="text-red-800 font-bold text-lg">Property Rejected</p>
                      <p className="text-sm text-red-700 mt-2">Edit your details and documents, then resubmit for verification.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Property
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={hasConfirmedFarmer}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all duration-300 ${
                        hasConfirmedFarmer
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-105"
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Property
                    </button>
                  </>
                )}
              </div>

              {hasConfirmedFarmer && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center mt-6">
                  <p className="text-sm font-semibold text-amber-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Delete disabled: This property has an accepted farmer request.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="flex border-b-2 border-gray-200">
                <button
                  onClick={() => setRequestTab("pending")}
                  className={`flex-1 py-4 px-6 font-semibold text-center transition-all ${
                    requestTab === "pending" ? "text-green-700 border-b-4 border-green-700" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Pending ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setRequestTab("approved")}
                  className={`flex-1 py-4 px-6 font-semibold text-center transition-all ${
                    requestTab === "approved" ? "text-green-700 border-b-4 border-green-700" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Approved ({approvedRequests.length})
                </button>
              </div>

              {requestsLoading && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading farmer requests...</p>
                </div>
              )}

              {requestsError && (
                <div className="text-center py-12 text-red-600">
                  {requestsError}
                  <button onClick={fetchFarmerRequests} className="ml-4 text-blue-600 underline">
                    Retry
                  </button>
                </div>
              )}

              {!requestsLoading && !requestsError && requestTab === "pending" && pendingRequests.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">No Pending Requests</h3>
                  <p className="text-gray-600 mt-2">New farmer applications will appear here</p>
                </div>
              )}

              {!requestsLoading && !requestsError && requestTab === "approved" && approvedRequests.length === 0 && (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">No Approved Requests</h3>
                  <p className="text-gray-600 mt-2">Approved requests will appear here</p>
                </div>
              )}

              {!requestsLoading && !requestsError && (
                <div className="space-y-6">
                  {(requestTab === "pending" ? pendingRequests : approvedRequests).map((request) => (
                    <FarmerRequestCard
                      key={request.id}
                      request={request}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Properties;