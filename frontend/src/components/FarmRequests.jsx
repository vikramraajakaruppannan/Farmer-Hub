import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button1';
import Input from '@/components/ui/input1';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FaPhoneAlt, FaUserAlt, FaMapMarkerAlt, FaBoxOpen, FaSearch, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import RequestDetail from './RequestDetail';

const fetchWantedProducts = async (sessionId) => {
  const response = await axios.get('http://localhost:8000/farmer/wanted-products', {
    headers: { 'x-session-id': sessionId },
  });
  return response.data;
};

const acceptRequest = async ({ productId, sessionId, farmerContact }) => {
  const response = await axios.post(
    `http://localhost:8000/farmer/accept-request/${productId}`,
    { farmer_contact: farmerContact },
    { headers: { 'x-session-id': sessionId } }
  );
  return response.data;
};

const ignoreRequest = async ({ productId, sessionId }) => {
  const response = await axios.post(
    `http://localhost:8000/farmer/ignore-request/${productId}`,
    {},
    { headers: { 'x-session-id': sessionId } }
  );
  return response.data;
};

function FarmRequests() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [contactError, setContactError] = useState('');
  const [pendingProductId, setPendingProductId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    navigate('/login', { state: { from: '/farmer/requests' } });
  }

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['wantedProducts', sessionId],
    queryFn: () => fetchWantedProducts(sessionId),
    enabled: !!sessionId,
    onError: (err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('session_id');
        navigate('/login', { state: { from: '/farmer/requests' } });
      }
      alert(err.response?.data?.detail || 'Failed to fetch requests');
    },
  });

  const mutation = useMutation({
    mutationFn: acceptRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['wantedProducts', sessionId]);
      alert(data.message);
      setShowContactModal(false);
      setContactNumber('');
      setPendingProductId(null);
      setShowDetail(false);
      setSelectedRequest(null);
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Failed to accept request');
      setShowContactModal(false);
      setContactNumber('');
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: ignoreRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['wantedProducts', sessionId]);
      alert(data.message);
      setShowDetail(false);
      setSelectedRequest(null);
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Failed to ignore request');
    },
  });

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setShowDetail(true);
  };

  const handleBack = () => {
    setShowDetail(false);
    setSelectedRequest(null);
  };

  const handleAccept = (productId) => {
    setPendingProductId(productId);
    setShowContactModal(true);
  };

  const handleSubmitContact = () => {
    if (!contactNumber.match(/^\+?\d{10,15}$/)) {
      setContactError('Please enter a valid phone number (10-15 digits, optional + prefix).');
      return;
    }
    mutation.mutate({ productId: pendingProductId, sessionId, farmerContact: contactNumber });
  };

  const handleIgnore = (productId) => {
    if (window.confirm('Are you sure you want to ignore this request?')) {
      ignoreMutation.mutate({ productId, sessionId });
    }
  };

  const resetFilters = () => {
    setCategoryFilter('All');
    setSearchQuery('');
    setSortBy('created_at');
  };

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
        const matchesSearch =
          req.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.buyers?.first_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        if (sortBy === 'requiredDateTime')
          return new Date(a.requiredDateTime || '9999-12-31') - new Date(b.requiredDateTime || '9999-12-31');
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [requests, categoryFilter, searchQuery, sortBy]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Vegetables':
        return <FaBoxOpen className="w-5 h-5 text-green-600" />;
      case 'Fruits':
        return <FaBoxOpen className="w-5 h-5 text-red-600" />;
      case 'Paddy':
        return <FaBoxOpen className="w-5 h-5 text-yellow-600" />;
      default:
        return <FaBoxOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FFF4] to-[#DFF5E3] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          {!showDetail ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <FaBoxOpen className="w-8 h-8 text-green-600" />
                  <h1 className="text-4xl font-extrabold text-green-800">Incoming Buyer Requests</h1>
                </div>
                
              </div>

              {/* Filter Bar */}
              <div className="sticky top-0 z-10 bg-white shadow-sm rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-1/3">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by product or buyer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                    aria-label="Search requests"
                  />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Paddy">Paddy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Newest First</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="requiredDateTime">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    onClick={resetFilters}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Reset filters"
                  >
                    <FaTimes className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Requests Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error.message || 'Failed to load requests.'}</p>
                  <Button onClick={() => queryClient.refetchQueries(['wantedProducts', sessionId])}>
                    Retry
                  </Button>
                </div>
              ) : filteredRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <img
                    src="/no-results.svg" // Replace with actual illustration
                    alt="No results"
                    className="mx-auto h-40 mb-4"
                  />
                  <p className="text-gray-500 text-lg">
                    🎉 No new requests right now. You’re all caught up!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-green-100"
                      onClick={() => handleSelectRequest(request)}
                      role="button"
                      aria-label={`View details for ${request.product_name}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 text-green-700 font-semibold text-lg">
                          {getCategoryIcon(request.category)}
                          {request.product_name}
                        </div>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded-full ${
                            request.requiredDateTime &&
                            new Date(request.requiredDateTime) <
                              new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {request.requiredDateTime &&
                          new Date(request.requiredDateTime) <
                            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                            ? 'Urgent'
                            : 'New'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {request.quantity} {request.unit}
                      </p>
                      <div className="flex items-center text-gray-500 mt-3 gap-2 text-sm">
                        <FaUserAlt />
                        {request.buyer_name || request.buyers?.first_name || 'Unknown'}
                      </div>
                      <div className="flex items-center text-gray-500 gap-2 text-sm mt-1">
                        <FaMapMarkerAlt />
                        {request.deliveryLocation || 'Not specified'}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <RequestDetail
                request={selectedRequest}
                onBack={handleBack}
                onAccept={handleAccept}
                onIgnore={handleIgnore}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Modal */}
        <AnimatePresence>
          {showContactModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white/90 backdrop-blur-lg border border-green-200 shadow-xl rounded-2xl p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2 mb-4">
                  <FaPhoneAlt /> Your Contact Info
                </h3>
                <Input
                  placeholder="e.g., +1234567890"
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    setContactError('');
                  }}
                  className={contactError ? 'border-red-500' : ''}
                  aria-invalid={!!contactError}
                  aria-describedby={contactError ? 'contact-error' : undefined}
                />
                {contactError && (
                  <p id="contact-error" className="text-red-500 text-sm mt-2">
                    {contactError}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowContactModal(false)}
                    disabled={mutation.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitContact}
                    disabled={!contactNumber || mutation.isLoading}
                  >
                    {mutation.isLoading ? (
                      <>
                        <FaPhoneAlt className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FarmRequests;