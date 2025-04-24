import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { useProducts } from '@/components/ProductContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import { Button } from '@/components/ui/button';

function WantedProductsPage() {
  const { user, logout, sessionId } = useAuth();
  const { products, loading, error, deleteProduct } = useProducts();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  // Fetch accepted requests (notifications)
  const fetchNotifications = async () => {
    const response = await axios.get('http://localhost:8000/buyer/accepted-requests', {
      headers: { 'x-session-id': sessionId },
    });
    return response.data.map((req) => ({
      request_id: req.request_id,
      product_id: req.product_id,
      product: req.product_name,
      quantity: `${req.quantity} ${req.unit}`,
      location: req.location,
      deadline: req.deadline ? new Date(req.deadline).toLocaleString() : 'Not specified',
      farmer: {
        name: req.farmer_name || 'Unknown Farmer',
        email: req.farmer_email || 'Not provided',
        contact: req.farmer_contact || 'Not provided',
      },
      status: req.status,
    }));
  };

  const { data: notifications, isLoading: notificationsLoading, error: notificationsError } = useQuery({
    queryKey: ['buyerNotifications', sessionId],
    queryFn: fetchNotifications,
    enabled: !!sessionId,
  });

  // Mutation to mark request as completed
  const markCompletedMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await axios.post(`http://localhost:8000/buyer/mark-request-completed/${requestId}`, {}, {
        headers: { 'x-session-id': sessionId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buyerNotifications', sessionId]);
      queryClient.invalidateQueries(['buyerProducts', sessionId]);
    },
    onError: (error) => {
      alert(error.response?.data?.detail || 'Failed to mark request as completed');
    },
  });

  // Mutation to reject request
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await axios.post(`http://localhost:8000/buyer/reject-request/${requestId}`, {}, {
        headers: { 'x-session-id': sessionId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['buyerNotifications', sessionId]);
      queryClient.invalidateQueries(['buyerProducts', sessionId]);
    },
    onError: (error) => {
      alert(error.response?.data?.detail || 'Failed to reject request');
    },
  });

  const handleMarkCompleted = (requestId) => {
    markCompletedMutation.mutate(requestId);
  };

  const handleRejectRequest = (requestId) => {
    rejectRequestMutation.mutate(requestId);
  };

  useEffect(() => {
    console.log('User data in WantedProductsPage:', user);
    console.log('Products in WantedProductsPage:', products);
    console.log('Notifications in WantedProductsPage:', notifications);
  }, [user, products, notifications]);

  const toggleProfileModal = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'vegetables':
        return 'bg-green-100 text-green-800';
      case 'fruits':
        return 'bg-yellow-100 text-yellow-800';
      case 'paddy':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo className="w-32 h-32 transition-transform hover:scale-105" />
        <div className="flex items-center gap-4">
          <button
            onClick={toggleProfileModal}
            className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-semibold hover:bg-green-600 transition-colors"
            title="View Profile"
          >
            {user?.first_name?.charAt(0) || 'U'}
          </button>
          <span className="text-gray-700 font-medium hidden sm:inline">
            {user?.first_name || 'User'}
          </span>
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Wanted Products
          </h2>
          <div className="flex gap-4">
            <Link to="/buyer/add-product">
              <Button
                variant="primary"
                className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                }
              >
                Add New Product
              </Button>
            </Link>
            <Link to="/buyer/notifications">
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
              >
                View Notifications
              </Button>
            </Link>
          </div>
        </div>

        <Card className="shadow-xl rounded-xl bg-white/90 backdrop-blur-sm p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Requested Products</h3>
          {error && (
            <p className="text-red-500 text-center mb-6 font-medium">{error}</p>
          )}
          {loading ? (
            <p className="text-center py-12 text-gray-600">Loading...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products added yet.{' '}
                <Link to="/buyer/add-product" className="text-green-500 hover:underline">
                  Add one now!
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  onClick={() => openProductModal(product)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 truncate">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Quantity: {product.quantity} {product.unit}
                      </p>
                      {product.deliveryLocation && (
                        <p className="text-gray-600 text-sm">
                          Delivery: {product.deliveryLocation}
                        </p>
                      )}
                      {product.requiredDateTime && (
                        <p className="text-gray-600 text-sm">
                          Required By: {new Date(product.requiredDateTime).toLocaleString()}
                        </p>
                      )}
                      {product.accepted && (
                        <p className="text-green-600 text-sm font-medium">
                          Status: {product.status || 'Pending'} {product.farmer ? `by ${product.farmer.name}` : ''}
                        </p>
                      )}
                      {product.notes && (
                        <p className="text-gray-500 text-sm mt-1 truncate">
                          Notes: {product.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className="mt-4 flex justify-between items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryClass(
                        product.category
                      )}`}
                    >
                      {product.category}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6v13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                          <path d="M6 6v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                        </svg>
                      }
                      onClick={() => deleteProduct(product.id)}
                      disabled={product.status === 'Completed'}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Profile Details</h3>
              <button
                onClick={toggleProfileModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Full Name:</span>
                <p className="text-gray-800">{user?.first_name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <p className="text-gray-800">{user?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                onClick={toggleProfileModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
              <button
                onClick={closeProductModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Product Name:</span>
                <p className="text-gray-800">{selectedProduct.product_name}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Category:</span>
                <p className="text-gray-800">{selectedProduct.category}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Quantity:</span>
                <p className="text-gray-800">{selectedProduct.quantity} {selectedProduct.unit}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Delivery Location:</span>
                <p className="text-gray-800">{selectedProduct.deliveryLocation || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Required By:</span>
                <p className="text-gray-800">
                  {selectedProduct.requiredDateTime
                    ? new Date(selectedProduct.requiredDateTime).toLocaleString()
                    : 'Not set'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Notes:</span>
                <p className="text-gray-800">{selectedProduct.notes || 'None'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created On:</span>
                <p className="text-gray-800">
                  {new Date(selectedProduct.created_at).toLocaleString()}
                </p>
              </div>
              {selectedProduct.accepted && selectedProduct.farmer && (
                <div>
                  <span className="text-gray-600 font-medium">Accepted By:</span>
                  <p className="text-gray-800">Status: {selectedProduct.status || 'Pending'}</p>
                  <p className="text-gray-800">Name: {selectedProduct.farmer.name || 'Unknown'}</p>
                  <p className="text-gray-800">Email: {selectedProduct.farmer.email || 'Not provided'}</p>
                  <p className="text-gray-800">Contact: {selectedProduct.farmer.contact || 'Not provided'}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                onClick={closeProductModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WantedProductsPage;