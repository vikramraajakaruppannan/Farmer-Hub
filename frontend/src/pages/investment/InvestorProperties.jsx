// src/pages/investment/InvestorProperties.jsx
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MapPin, Layers, DollarSign, Leaf, Droplets,
  Search, SlidersHorizontal, X,XCircle, Clock, CheckCircle2, RefreshCw, ChevronRight,
  LayoutGrid, List, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

/* ─── Status helpers ─── */
const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,         bg: 'bg-amber-50',   text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400'  },
  approved: { label: 'Approved', icon: CheckCircle2,  bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500'},
  rejected: { label: 'Rejected', icon: XCircle,       bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400'    },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
};

/* ─── Property Card with restriction ─── */
const PropertyCard = ({ property, view = 'grid' }) => {
  const navigate = useNavigate();
  const priceNum = Number(property.price || 0);
  const pricePerAcre = property.area ? `₹${Math.round(priceNum / property.area).toLocaleString()}/ac` : null;

  const handleCardClick = () => {
    if (property.has_applied) {
      toast({
        title: "Already Applied",
        description: `You already applied for this land (Status: ${property.application_status || 'Pending'}).`,
        variant: "default"
      });
      if (property.application_id) {
        navigate(`/investment/applied/${property.application_id}`);
      }
    } else {
      navigate(`/investment/property/${property.id}`);
    }
  };

  const isApplied = property.has_applied === true;

  if (view === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className={`group cursor-pointer flex gap-6 items-center bg-white border rounded-3xl p-6 transition-all duration-300 ${
          isApplied ? 'border-amber-400 bg-amber-50/60 hover:bg-amber-100' : 'border-gray-200 hover:border-green-400 hover:shadow-lg'
        }`}
      >
        <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center ring-1 ring-green-200">
          <Sprout size={32} className="text-green-600 group-hover:rotate-12 transition-transform" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-green-700">
                {property.title || 'Unnamed Land'}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={14} /> {property.location || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-700">₹{priceNum.toLocaleString()}</p>
              <p className="text-xs text-gray-400">per year</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Layers size={16} className="text-green-600" /> {property.area ? `${property.area} acres` : 'N/A'}</span>
            <span className="flex items-center gap-1.5"><Leaf size={16} className="text-amber-500" /> {property.soil_type || 'N/A'}</span>
            <span className="flex items-center gap-1.5"><Droplets size={16} className="text-blue-500" /> {property.water_source || 'N/A'}</span>
            {pricePerAcre && <span className="ml-auto font-semibold text-green-600 text-base">{pricePerAcre}</span>}
          </div>

          {isApplied && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
              <AlertCircle size={16} /> Already Applied ({property.application_status || 'Pending'})
            </div>
          )}
        </div>

        <ChevronRight size={22} className="text-gray-400 group-hover:text-green-600 transition-colors" />
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer bg-white border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full ${
        isApplied ? 'border-amber-400 bg-amber-50/50' : 'border-gray-200 hover:border-green-400'
      }`}
    >
      <div className="relative h-52 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#16a34a_1px,transparent_1px)] bg-[length:22px_22px]" />
        <Sprout size={56} className="text-green-300 group-hover:scale-110 transition-transform duration-500" />

        <div className="absolute top-4 left-4 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          VERIFIED
        </div>

        {pricePerAcre && <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 text-xs font-semibold text-green-700 rounded-2xl shadow">{pricePerAcre}</div>}

        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-5 py-3">
          <p className="text-white text-sm flex items-center gap-1 font-medium"><MapPin size={14} /> {property.location || 'N/A'}</p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
          {property.title || 'Unnamed Land'}
        </h3>

        <div className="flex justify-between mt-6 mb-5">
          <div>
            <p className="text-xs tracking-widest text-gray-400 font-medium">ANNUAL LEASE</p>
            <p className="text-3xl font-bold text-green-700">₹{priceNum.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-widest text-gray-400 font-medium">AREA</p>
            <p className="text-2xl font-semibold text-gray-800">{property.area ? `${property.area} ac` : 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          {[
            { icon: Leaf, color: 'text-amber-500', label: 'Soil', val: property.soil_type },
            { icon: Droplets, color: 'text-blue-500', label: 'Water', val: property.water_source },
          ].map(({ icon: Icon, color, label, val }) => (
            <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <Icon size={18} className={color} />
              <div>
                <p className="text-[10px] text-gray-400 font-medium tracking-widest">{label}</p>
                <p className="font-medium text-gray-700 text-sm truncate">{val || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>

        {isApplied ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-amber-700 bg-amber-100 px-4 py-3 rounded-xl">
            <AlertCircle size={16} /> Already Applied ({property.application_status || 'Pending'})
          </div>
        ) : (
          <Button
            className="mt-6 w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          >
            View & Apply <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

/* ─── My Lease Requests with Re-Apply Feature ─── */
const MyLeaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyRequests = async () => {
    try {
      const res = await api('/farmer/my-lease-applications');
      if (res.ok) setRequests((await res.json()) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  // Re-Apply: Reset existing application to pending
  const handleReApply = async (applicationId) => {
    if (!window.confirm("Re-apply? This will reset your application to pending status for admin review.")) return;

    try {
      const res = await api(`/farmer/lease-applications/${applicationId}/reapply`, { method: 'PATCH' });

      if (res.ok) {
        toast({
          title: "Re-Applied Successfully",
          description: "Your application has been reset to pending and sent back for review.",
        });
        fetchMyRequests(); // refresh
      } else {
        toast({ title: "Failed", description: "Could not re-apply", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="mb-12 space-y-6">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
        </div>
      </div>
    );
  }

  if (requests.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Lease Requests</h2>
          <p className="text-sm text-gray-500 mt-1">
            {requests.length} total application{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => {
          const property = req.properties || {};
          const status = req.status || 'pending';
          const isRejected = status === 'rejected';

          return (
            <Card
              key={req.id}
              className={`overflow-hidden transition-all duration-300 cursor-pointer border ${
                isRejected ? 'border-red-300 bg-red-50/70' : 'border-gray-200 hover:border-green-300 hover:shadow-md'
              }`}
              onClick={() => navigate(`/investment/applied/${req.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Sprout size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isRejected ? 'text-red-700' : 'text-gray-900 group-hover:text-green-700'}`}>
                      {property.title || 'Property Request'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={13} /> {property.location || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">ADMIN</span>
                    <StatusPill status={status} />
                  </div>
                  {status === 'approved' && req.investor_status && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-medium">INVESTOR</span>
                      <StatusPill status={req.investor_status} />
                    </div>
                  )}
                </div>

                {isRejected && req.rejected_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <p className="font-medium mb-1">Rejection Reason:</p>
                    <p>{req.rejected_reason}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs">Proposed Rent</p>
                    <p className="font-semibold text-gray-900">₹{req.proposed_rent?.toLocaleString() || '—'}/mo</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="font-semibold text-gray-900">{req.lease_duration_years || '—'} years</p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-5">
                  {isRejected ? 'Rejected on' : 'Applied on'} {req.updated_at || req.created_at 
                    ? new Date(req.updated_at || req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                    : '—'}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => { e.stopPropagation(); navigate(`/investment/applied/${req.id}`); }}
                  >
                    View Details
                  </Button>

                  {isRejected && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReApply(req.id);
                      }}
                    >
                      Re-Apply
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

/* ─── Filter Bar (unchanged) ─── */
const FilterBar = ({ filters, setFilters, onRefresh, count }) => {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-10 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search ?? ''}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            placeholder="Search by location, soil, or title…"
            className="w-full pl-12 pr-5 py-3.5 text-base border border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-medium border transition-all text-sm ${
              open || activeCount > 0 ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 hover:border-green-300 hover:text-green-700'
            }`}
          >
            <SlidersHorizontal size={18} /> Filters
            {activeCount > 0 && <span className="bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>}
          </button>
          <button onClick={onRefresh} className="p-3.5 border border-gray-200 rounded-2xl hover:border-green-300 transition-colors" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { key: 'location', label: 'Location', options: ['North Bangalore', 'Mysore Rural', 'Hassan District'] },
            { key: 'soilType', label: 'Soil Type', options: ['Black Cotton', 'Red Sandy Loam', 'Alluvial'] },
            { key: 'priceRange', label: 'Price (₹/yr)', options: [
              { value: 'low', label: 'Below ₹20,000' },
              { value: 'medium', label: '₹20,000 – ₹30,000' },
              { value: 'high', label: 'Above ₹30,000' },
            ]},
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
              <select
                value={filters[key] ?? ''}
                onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:border-green-400 focus:ring-4 focus:ring-green-100 bg-white"
              >
                <option value="">All</option>
                {options.map(o =>
                  typeof o === 'string' ? (
                    <option key={o} value={o}>{o}</option>
                  ) : (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  )
                )}
              </select>
            </div>
          ))}
          {activeCount > 0 && (
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={() => setFilters({ location: '', soilType: '', priceRange: '', search: '' })}
                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-medium"
              >
                <X size={14} /> Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {count !== undefined && (
        <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
          {count} propert{count !== 1 ? 'ies' : 'y'} found
        </p>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
const InvestorProperties = () => {
  const [filters, setFilters] = useState({ search: '', location: '', soilType: '', priceRange: '' });
  const [view, setView] = useState('grid');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/farmer/verified-properties');
      if (!res.ok) throw new Error('Failed to fetch properties');
      setProperties(await res.json() || []);
    } catch (err) {
      setError(err.message || 'Could not load verified lands');
      toast({ title: "Error", description: err.message || "Failed to load properties", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => {
    const price = parseFloat(p.price || 0);
    const searchLower = filters.search.toLowerCase();
    const searchMatch = !filters.search ||
      [p.title, p.location, p.district, p.soil_type, p.water_source]
        .some(f => f?.toLowerCase().includes(searchLower));

    return searchMatch &&
      (!filters.location || p.location === filters.location) &&
      (!filters.soilType || p.soil_type === filters.soilType) &&
      (!filters.priceRange || (
        (filters.priceRange === 'low' && price < 20000) ||
        (filters.priceRange === 'medium' && price >= 20000 && price <= 30000) ||
        (filters.priceRange === 'high' && price > 30000)
      ));
  });

  return (
    <div className="flex min-h-screen bg-gray-50/70">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <MyLeaseRequests />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[2px] text-green-600">Farmland Marketplace</p>
              <h1 className="text-4xl font-bold text-gray-900 mt-1">Available Agricultural Lands</h1>
              <p className="text-gray-500 mt-2">Verified & ready-to-lease farmland across Karnataka</p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1 self-start sm:self-end">
              {[{ id: 'grid', icon: LayoutGrid }, { id: 'list', icon: List }].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`p-3 rounded-xl transition-all ${view === id ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <FilterBar filters={filters} setFilters={setFilters} onRefresh={fetchProperties} count={!loading && !error ? filteredProperties.length : undefined} />

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[420px] w-full rounded-3xl" />)}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-20">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800 mb-2">{error}</p>
              <Button onClick={fetchProperties} className="mt-4">Try Again</Button>
            </div>
          )}

          {!loading && !error && filteredProperties.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Sprout size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No matching properties</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
              <Button variant="outline" onClick={() => { setFilters({ search: '', location: '', soilType: '', priceRange: '' }); fetchProperties(); }}>
                <RefreshCw size={16} className="mr-2" /> Reset Filters
              </Button>
            </div>
          )}

          {!loading && !error && filteredProperties.length > 0 && (
            view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map(property => <PropertyCard key={property.id} property={property} view="grid" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProperties.map(property => <PropertyCard key={property.id} property={property} view="list" />)}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default InvestorProperties;