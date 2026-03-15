// src/pages/investment/AppliedDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  MapPin, Droplets, Leaf, Layers, DollarSign, 
  CheckCircle2, FileText, Shield, ArrowLeft, AlertCircle, Loader2, 
  Clock, XCircle, Calendar, Trash2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { api } from '@/lib/api';

/* ─── Status helpers for timeline ─── */
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-amber-500',   icon: Clock,         text: 'text-amber-700' },
  approved:  { label: 'Approved',  color: 'bg-emerald-500', icon: CheckCircle2,  text: 'text-emerald-700' },
  rejected:  { label: 'Rejected',  color: 'bg-red-500',     icon: XCircle,       text: 'text-red-700' },
  accepted:  { label: 'Accepted',  color: 'bg-emerald-500', icon: CheckCircle2,  text: 'text-emerald-700' },
  declined:  { label: 'Declined',  color: 'bg-red-500',     icon: XCircle,       text: 'text-red-700' },
};

/* ─── Timeline Step Component ─── */
const TimelineStep = ({ status, label, date, isLast = false }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <div className="flex items-start gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${cfg.color} flex items-center justify-center text-white shadow-md z-10`}>
          <cfg.icon size={20} />
        </div>
        {!isLast && (
          <div className="absolute top-10 bottom-0 left-5 w-0.5 bg-gray-200 -z-10" />
        )}
      </div>
      
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-3">
          <h4 className={`font-semibold ${cfg.text}`}>{label}</h4>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.color.replace('bg-', 'bg-')} bg-opacity-10 text-white`}>
            {cfg.label}
          </span>
        </div>
        {date && (
          <p className="text-sm text-gray-500 mt-1">
            {new Date(date).toLocaleString('en-IN', { 
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const AppliedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No application ID in URL");
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        const res = await api(`/farmer/lease-application/${id}`);
        if (!res.ok) throw new Error("Application not found or not authorized");
        const data = await res.json();
        setApplication(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load application details");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // Delete entire pending application
  const handleDeleteApplication = async () => {
    if (!window.confirm("Are you sure you want to delete this pending application? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await api(`/farmer/lease-application/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Delete failed");
      }

      alert("Application deleted successfully");
      navigate('/investment'); // or your applications list page
    } catch (err) {
      alert("Error deleting application: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your lease application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50/40 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Not Found</h2>
          <p className="text-gray-600 mb-8">{error || "This application may not exist or you are not authorized to view it."}</p>
          <Button 
            onClick={() => navigate('/investment')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6"
          >
            Back to My Applications
          </Button>
        </Card>
      </div>
    );
  }

  const property = application.property || {};
  const adminStatus = application.status || 'pending';
  const investorStatus = application.investor_status || 'pending';

  // Extract documents safely
  const documents = [
    { type: 'id_proof',        label: 'ID Proof',         url: application.id_proof_url },
    { type: 'income_proof',    label: 'Income Proof',     url: application.income_proof_url },
    { type: 'bank_statement',  label: 'Bank Statement',   url: application.bank_statement_url },
    ...(application.additional_docs_url || []).map((url, idx) => ({
      type: 'additional',
      label: `Additional Document ${idx + 1}`,
      url: url
    }))
  ].filter(doc => doc.url);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50/40">
      <Sidebar />
      
      <main className="flex-1 p-5 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/investment')}
            className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to My Applications
          </button>

          <Card className="shadow-xl border border-green-100/60 rounded-2xl overflow-hidden bg-white">
            {/* Hero */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              
              <div className="absolute top-6 right-6 z-10 flex gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-full shadow-lg ${
                  adminStatus === 'approved' ? 'bg-green-600' :
                  adminStatus === 'rejected' ? 'bg-red-600' :
                  'bg-yellow-600'
                }`}>
                  {adminStatus === 'approved' ? <CheckCircle2 size={18} /> :
                   adminStatus === 'rejected' ? <XCircle size={18} /> :
                   <Clock size={18} />}
                  Admin: {adminStatus.charAt(0).toUpperCase() + adminStatus.slice(1)}
                </span>

                {adminStatus === 'approved' && (
                  <span className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-full shadow-lg ${
                    investorStatus === 'accepted' ? 'bg-green-600' :
                    investorStatus === 'declined' ? 'bg-red-600' :
                    'bg-yellow-600'
                  }`}>
                    {investorStatus === 'accepted' ? <CheckCircle2 size={18} /> :
                     investorStatus === 'declined' ? <XCircle size={18} /> :
                     <Clock size={18} />}
                    Investor: {investorStatus.charAt(0).toUpperCase() + investorStatus.slice(1)}
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  {property.title || "Property Application"}
                </h1>
                <div className="flex items-center gap-2 text-lg opacity-90">
                  <MapPin size={20} />
                  <span>{property.location || "N/A"}, {property.district || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 md:p-10">
              {/* Timeline */}
              <div className="mb-12">
                <h2 className="text-xl font-bold text-green-900 mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-green-600" />
                  Application Status Timeline
                </h2>

                <div className="space-y-8 pl-5 border-l-4 border-gray-200 relative">
                  <TimelineStep 
                    status={adminStatus}
                    label="Admin Approval"
                    date={application.updated_at || application.created_at}
                  />
                  
                  {adminStatus === 'approved' && (
                    <TimelineStep 
                      status={investorStatus}
                      label="Investor Approval"
                      date={application.investor_updated_at}
                      isLast={true}
                    />
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-green-50 rounded-xl p-6 border border-green-100 text-center">
                  <DollarSign className="mx-auto mb-2 text-green-600" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Proposed Rent</p>
                  <p className="text-3xl font-bold text-green-800">₹{Number(application.proposed_rent).toLocaleString()}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
                  <Layers className="mx-auto mb-2 text-blue-600" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Lease Duration</p>
                  <p className="text-3xl font-bold text-gray-800">{application.lease_duration_years} years</p>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 text-center">
                  <Calendar className="mx-auto mb-2 text-amber-600" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Applied On</p>
                  <p className="text-xl font-bold text-amber-800">
                    {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Droplets className="text-blue-600" size={20} />
                      Property Water Source
                    </h3>
                    <p className="text-gray-700">{property.water_source || "Not specified"}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Leaf className="text-amber-600" size={20} />
                      Planned Crops
                    </h3>
                    <p className="text-gray-700">{application.planned_crops || "Not specified"}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="text-indigo-600" size={20} />
                      Message to Owner
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {application.message_to_owner || "No message provided."}
                    </p>
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="text-green-600" size={20} />
                    Uploaded Documents ({documents.length})
                  </h3>

                  {documents.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No documents uploaded for this application</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="text-green-600" size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {doc.label}
                              </p>
                              <p className="text-xs text-gray-500">Click to view</p>
                            </div>
                          </div>

                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline"
                  className="flex-1 border-green-600 text-green-700 hover:bg-green-50 text-lg py-6 font-medium"
                  onClick={() => navigate('/investment')}
                >
                  ← Back to My Applications
                </Button>

                {application.status === 'pending' && (
                  <Button 
                    variant="destructive"
                    className="flex-1 text-lg py-6 font-semibold"
                    disabled={deleting}
                    onClick={handleDeleteApplication}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-5 w-5" />
                        Delete Application
                      </>
                    )}
                  </Button>
                )}

                {application.status === 'approved' && application.investor_status === 'pending' && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6 font-semibold"
                    onClick={() => alert("Contact the property owner directly to proceed (feature coming soon)")}
                  >
                    Follow Up with Owner →
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AppliedDetail;