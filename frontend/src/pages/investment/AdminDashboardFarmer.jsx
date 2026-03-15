// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, Clock, User, Phone, MapPin,
  FileText, Shield, ChevronDown, ChevronUp, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-800 border-amber-300' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      {status === 'pending' && <Clock size={14} className="mr-1" />}
      {status === 'approved' && <CheckCircle2 size={14} className="mr-1" />}
      {status === 'rejected' && <XCircle size={14} className="mr-1" />}
      {cfg.label}
    </span>
  );
};

const DocumentLink = ({ label, url }) => {
  if (!url) return null;
  const fileName = (() => {
    try {
      return decodeURIComponent(url.split('/').pop().split('?')[0]);
    } catch {
      return label;
    }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 hover:underline"
    >
      <FileText size={16} />
      {fileName}
    </a>
  );
};

const AppCard = ({ app, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const adminStatus = app.status ?? 'pending';
  const investorStatus = app.investor_status;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                {(app.profiles?.first_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {app.profiles?.first_name || 'Unknown Farmer'}
                </h3>
                {app.profiles?.mobile && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone size={14} /> {app.profiles.mobile}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 flex items-center gap-1">
              <MapPin size={14} className="text-gray-500" />
              {app.properties?.location || 'N/A'}, {app.properties?.district || 'N/A'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Admin:</span>
              <StatusBadge status={adminStatus} />
            </div>

            {adminStatus === 'approved' && investorStatus && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Investor:</span>
                <StatusBadge status={investorStatus} />
              </div>
            )}

            {adminStatus === 'pending' && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => onReject(app)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove(app.id)}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-900">
            {app.properties?.title || 'Property Application'}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Annual Rent: ₹{Number(app.proposed_rent || 0).toLocaleString()} 
            <p>Total Years:  {app.lease_duration_years || '?'} years</p>
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm text-gray-600 hover:text-green-700 flex items-center gap-1"
        >
          {expanded ? 'Hide' : 'Show'} details & documents
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <div className="space-y-6">
            {/* Application Info */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Application Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Planned Crops</p>
                  <p className="font-medium">{app.planned_crops || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Message to Owner</p>
                  <p className="font-medium">{app.message_to_owner || '—'}</p>
                </div>
                {app.rejected_reason && adminStatus === 'rejected' && (
                  <div className="sm:col-span-2">
                    <p className="text-gray-500">Rejection Reason (Admin)</p>
                    <p className="text-red-700 font-medium">{app.rejected_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-green-600" />
                Uploaded Documents
              </h5>

              <div className="space-y-3">
                <DocumentLink label="ID Proof" url={app.id_proof_url} />
                <DocumentLink label="Income Proof" url={app.income_proof_url} />
                <DocumentLink label="Bank Statement" url={app.bank_statement_url} />
                {app.additional_docs_url?.length > 0 && (
                  <div className="pl-6 space-y-2">
                    {app.additional_docs_url.map((url, idx) => (
                      <DocumentLink key={idx} label={`Additional Document ${idx + 1}`} url={url} />
                    ))}
                  </div>
                )}

                {!app.id_proof_url && !app.income_proof_url && !app.bank_statement_url && 
                 (!app.additional_docs_url || app.additional_docs_url.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Admin Dashboard ─── */
const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/farmer/admin/lease-applications');
      if (!res.ok) throw new Error('Failed to load applications');
      const data = await res.json();
      setApplications(data || []);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Could not load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api(`/farmer/admin/lease-applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Approve failed');
      toast({ title: "Success", description: "Application approved" });
      fetchApplications();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = (app) => setRejectTarget(app);

  const confirmReject = async (reason) => {
    try {
      const res = await api(`/farmer/admin/lease-applications/${rejectTarget.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', rejected_reason: reason }),
      });
      if (!res.ok) throw new Error('Reject failed');
      toast({ title: "Success", description: "Application rejected" });
      fetchApplications();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setRejectTarget(null);
  };

  // Filter applications based on active tab
  const visibleApps = applications.filter(app => {
    const status = app.status ?? 'pending';
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return status === 'pending';
    if (activeTab === 'approved') return status === 'approved';
    if (activeTab === 'rejected') return status === 'rejected';
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lease Applications</h1>
            <p className="text-gray-600 mt-1">
              {visibleApps.length} application{visibleApps.length !== 1 ? 's' : ''} in this view
            </p>
          </div>
          <Button variant="outline" onClick={fetchApplications}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {['pending', 'approved', 'rejected', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'All Applications' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to load applications</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchApplications}>Retry</Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && visibleApps.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No applications in this category</h3>
            <p className="text-gray-600 mt-2">
              {activeTab === 'all' ? 'No lease requests found' : `No ${activeTab} applications`}
            </p>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && visibleApps.length > 0 && (
          <div className="space-y-5">
            {visibleApps.map(app => (
              <AppCard
                key={app.id}
                app={app}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Reject Application</h3>
              <p className="text-gray-600 mt-1">
                Are you sure you want to reject <strong>{rejectTarget.profiles?.first_name || "this farmer"}</strong>'s application for <strong>{rejectTarget.properties?.title}</strong>?
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectTarget.reason || ''}
                onChange={e => setRejectTarget(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain the reason clearly..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
              />
            </div>

            <div className="p-6 border-t flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRejectTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!rejectTarget.reason?.trim()}
                onClick={() => confirmReject(rejectTarget.reason.trim())}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;