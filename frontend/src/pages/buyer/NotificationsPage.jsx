import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function NotificationsPage() {
  const { user, logout, sessionId } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
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

  const toggleProfileModal = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">

      <Link to="/buyer/dashboard" className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <Logo className="w-32 h-32 transition-transform hover:scale-105" />
      </Link>
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
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-8">
          Notifications
        </h2>

        <Card className="shadow-xl rounded-xl bg-white/90 backdrop-blur-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Requests</h3>
          {notificationsLoading && <p className="text-gray-500">Loading...</p>}
          {notificationsError && (
            <p className="text-red-500">Failed to load notifications: {notificationsError.message}</p>
          )}
          {!notificationsLoading && !notificationsError && (!notifications || notifications.length === 0) && (
            <p className="text-gray-500">No pending notifications available.</p>
          )}
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <div key={notification.request_id} className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800">{notification.product}</h4>
                <p className="text-gray-500 mt-1">{notification.quantity}</p>
                <p className="text-gray-500">Location: {notification.location}</p>
                <p className="text-gray-500">Deadline: {notification.deadline}</p>
                <p className="text-gray-500">Status: {notification.status}</p>
                <div className="mt-2">
                  <p className="text-gray-500">Accepted by:</p>
                  <p className="text-gray-800">Name: {notification.farmer.name}</p>
                  <p className="text-gray-800">Email: {notification.farmer.email}</p>
                  <p className="text-gray-800">Contact: {notification.farmer.contact}</p>
                </div>
                {notification.status === 'Pending' && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleMarkCompleted(notification.request_id)}
                      disabled={markCompletedMutation.isLoading}
                    >
                      {markCompletedMutation.isLoading ? 'Marking...' : 'Mark as Accepted'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => handleRejectRequest(notification.request_id)}
                      disabled={rejectRequestMutation.isLoading}
                    >
                      {rejectRequestMutation.isLoading ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
    </div>
  );
}

export default NotificationsPage;