// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  Shield, Clock, CheckCircle, XCircle, Eye, User, Mail, Phone,
  MapPin, Layers, DollarSign, Calendar, FileText, AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

const AdminDashboard = () => {
  const [pendingVerification, setPendingVerification] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api("/admin/dashboard-data");
      if (!response.ok) throw new Error("Failed to load");
      const data = await response.json();
      setPendingVerification(data.pending_verification || []);
      setChangeRequests(data.change_requests || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load admin data. Make sure you're logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const verify = async (id) => {
    if (!window.confirm("Verify this property?")) return;
    try {
      await api(`/admin/properties/${id}/verify`, { method: "POST" });
      alert("Property verified!");
      fetchData();
    } catch (err) {
      alert("Failed to verify");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this property?")) return;
    try {
      await api(`/admin/properties/${id}/reject`, { method: "POST" });
      alert("Property rejected");
      fetchData();
    } catch (err) {
      alert("Failed to reject");
    }
  };

  const approveChange = async (id, type) => {
    if (!window.confirm(`Approve ${type} request?`)) return;
    try {
      await api(`/admin/properties/${id}/approve-change`, { method: "POST" });
      alert(type === "delete" ? "Property deleted" : "Edit approved");
      fetchData();
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const rejectChange = async (id) => {
    if (!window.confirm("Reject change request?")) return;
    try {
      await api(`/admin/properties/${id}/reject-change`, { method: "POST" });
      alert("Change request rejected");
      fetchData();
    } catch (err) {
      alert("Failed to reject");
    }
  };

  const viewDocuments = (urls) => {
    if (!urls || urls.length === 0) {
      alert("No documents uploaded");
      return;
    }
    urls.forEach((url, i) => window.open(url, `_blank_admin_${i}`));
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
      return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>;
    }
    return <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-red-600" /></div>;
  };

  const PropertyCard = ({ p, type }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{p.title}</h3>
          <p className="text-gray-600 flex items-center gap-2 mt-2">
            <MapPin className="w-5 h-5" /> {p.location}, {p.district}
          </p>
        </div>
        <span className={`px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 ${
          type === "verification" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
        }`}>
          {type === "verification" ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {type === "verification" ? "Pending Verification" : "Change Requested"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600">Area</p><p className="text-xl font-bold">{p.area} acres</p></div>
        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600">Rent</p><p className="text-xl font-bold">₹{p.price}/mo</p></div>
        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600">Soil</p><p className="text-lg font-bold">{p.soil_type}</p></div>
        <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-600">Water</p><p className="text-lg font-bold">{p.water_source}</p></div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h4 className="font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5" />Investor Details</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-600">Name</p><p className="font-semibold">{p.investor_name || "N/A"}</p></div>
          <div><p className="text-gray-600">Email</p><p className="font-semibold">{p.investor_email || "N/A"}</p></div>
          <div><p className="text-gray-600">Phone</p><p className="font-semibold">{p.investor_mobile || "N/A"}</p></div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          Submitted: {new Date(p.created_at).toLocaleDateString()}
        </div>
      </div>

      {type === "change" && p.change_request && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p className="font-bold text-amber-900 mb-2">Request Type: {p.change_request.type.toUpperCase()}</p>
          <p className="italic text-gray-800">" {p.change_request.reason} "</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Uploaded Documents</h3>
              <p className="text-sm text-gray-600">Review all submitted files</p>
            </div>
          </div>
          <div className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full">
            {p.document_urls?.length || 0} Files
          </div>
        </div>

        {(!p.document_urls || p.document_urls.length === 0) ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No documents uploaded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {p.document_urls.map((url, index) => (
              <div key={index} className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(url)}
                  <div>
                    <p className="font-medium text-gray-800 truncate max-w-md">
                      {getFileName(url)}
                    </p>
                    <p className="text-xs text-gray-500">Document {index + 1}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(url, `_blank_admin_${index}`)}
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

      <div className="flex gap-6">
        <button
          onClick={() => viewDocuments(p.document_urls)}
          className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
        >
          <Eye className="w-6 h-6" />
          Quick View All Documents
        </button>

        {type === "verification" ? (
          <>
            <button
              onClick={() => verify(p.id)}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              Verify Property
            </button>
            <button
              onClick={() => reject(p.id)}
              className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <XCircle className="w-6 h-6" />
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => approveChange(p.id, p.change_request.type)}
              className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              Approve {p.change_request.type}
            </button>
            <button
              onClick={() => rejectChange(p.id)}
              className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <XCircle className="w-6 h-6" />
              Reject Request
            </button>
          </>
        )}
      </div>
    </div>
  );

  const Section = ({ title, count, icon: Icon, children }) => (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-800">{title}</h2>
        <span className="ml-auto bg-purple-100 text-purple-800 font-bold text-2xl px-6 py-3 rounded-full shadow-md">
          {count}
        </span>
      </div>
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Admin Control Panel</h1>
            <p className="text-xl text-gray-600">Manage property verification and change requests</p>
          </div>

          {loading ? (
            <div className="text-center py-32">
              <div className="w-24 h-24 border-8 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
              <p className="text-2xl text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              <Section title="Pending Verification" count={pendingVerification.length} icon={Clock}>
                {pendingVerification.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No new properties to verify</p>
                  </div>
                ) : (
                  pendingVerification.map(p => <PropertyCard key={p.id} p={p} type="verification" />)
                )}
              </Section>

              <Section title="Change Requests (Edit/Delete)" count={changeRequests.length} icon={AlertCircle}>
                {changeRequests.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No change requests pending</p>
                  </div>
                ) : (
                  changeRequests.map(p => <PropertyCard key={p.id} p={p} type="change" />)
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;