import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  MapPin, Droplets, Leaf, Layers, DollarSign, 
  CheckCircle, FileText, Shield, ArrowLeft, Calendar, AlertCircle, Loader2 
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { api } from '@/lib/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchProperty = async () => {
      if (!id) {
        setError("No property ID in URL.");
        setLoading(false);
        return;
      }

      console.log(`[PropertyDetails] Starting fetch for ID: ${id}`);

      setLoading(true);
      setError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const res = await api(`/farmer/property/${id}`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text().catch(() => 'No error details');
          throw new Error(`API failed: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        console.log("[PropertyDetails] Property data received:", data);

        if (mounted) {
          setProperty(data);
        }
      } catch (err) {
        console.error("[PropertyDetails] Fetch error:", err.message);
        if (mounted) {
          if (err.name === 'AbortError') {
            setError("Request timed out. Please try again.");
          } else if (err.message.includes('404')) {
            setError("Property not found or not verified.");
          } else {
            setError("Failed to load property details. Please try again later.");
          }
        }
      } finally {
        if (mounted) {
          console.log("[PropertyDetails] Fetch completed. Setting loading=false");
          setLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () => {
    // Use absolute path to your verified lands / listings page
    // Change this to your actual route if different!
    navigate('/investment');  // or '/farmer/verified-lands', '/listings', etc.
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50/40 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">Loading property details...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching verified land information</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50/40 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center shadow-xl border border-red-100">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Property</h2>
          <p className="text-gray-600 mb-6">{error || "This property may not exist, is not verified, or there was a connection issue."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-600 text-red-700 hover:bg-red-50 px-8 py-6"
            >
              Retry
            </Button>
            <Button 
              onClick={handleBack}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6"
            >
              Back to Listings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Success - real property data is here
  const getFileName = (url) => {
    try {
      const name = decodeURIComponent(url.split('/').pop().split('?')[0]);
      return name.length > 30 ? name.substring(0, 27) + '...' : name;
    } catch {
      return `Document ${url.substring(0, 8)}...`;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-emerald-50/40">
      <Sidebar />
      
      <main className="flex-1 p-5 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Listings
          </button>

          <Card className="shadow-xl border border-green-100/60 rounded-2xl overflow-hidden bg-white">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              
              <div className="absolute top-6 right-6 z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full shadow-lg">
                  <Shield size={18} />
                  Verified Property
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  {property.title || "Unnamed Property"}
                </h1>
                <div className="flex items-center gap-2 text-lg opacity-90">
                  <MapPin size={20} />
                  <span>{property.location || "N/A"}, {property.district || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 md:p-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-green-50 rounded-xl p-6 border border-green-100 text-center">
                  <DollarSign className="mx-auto mb-2 text-green-600" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-green-800">
                    ₹{property.price ? Number(property.price).toLocaleString() : "N/A"}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
                  <Layers className="mx-auto mb-2 text-blue-600" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Total Area</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {property.area ? `${property.area} acres` : "N/A"}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 text-center">
                  <Leaf className="mx-auto mb-2 text-amber-600" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Soil Type</p>
                  <p className="text-xl font-bold text-amber-800">{property.soil_type || "N/A"}</p>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Droplets className="text-blue-600" size={20} />
                      Water Source
                    </h3>
                    <p className="text-gray-700">{property.water_source || "Not specified"}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FileText className="text-indigo-600" size={20} />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {property.description || "No detailed description provided."}
                    </p>
                  </div>

                  {property.boundaries && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="text-purple-600" size={20} />
                        Boundaries
                      </h3>
                      <pre className="text-sm bg-gray-50 p-4 rounded-lg font-mono whitespace-pre-wrap border border-gray-200 overflow-auto max-h-40">
                        {property.boundaries}
                      </pre>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="text-green-600" size={20} />
                    Verified Documents ({property.document_urls?.length || 0})
                  </h3>

                  {(!property.document_urls || property.document_urls.length === 0) ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No documents uploaded for this property</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {property.document_urls.map((url, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {getFileName(url)}
                              </p>
                              <p className="text-xs text-gray-500">Click to view</p>
                            </div>
                          </div>
                          
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
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
                  onClick={handleBack}
                >
                  ← Back to Listings
                </Button>
                
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6 font-semibold"
                  onClick={() => {
                    navigate('/investment/apply/property-details', { 
                      state: { property }  // Pass real property to application flow
                    });
                  }}
                >
                  Apply to Lease This Land →
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;