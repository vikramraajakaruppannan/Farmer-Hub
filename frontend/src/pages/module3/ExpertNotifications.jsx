import React, { useState, useEffect } from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import NotificationCard from '@/components/expert/NotificationCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ExpertNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          setError('No session ID found. Please log in.');
          navigate('/login');
          return;
        }
        const response = await fetch('http://localhost:8000/notifications', {
          headers: {
            'X-Session-ID': sessionId,
          },
        });
        console.log('Response Status:', response.status);
        const responseText = await response.text();
        console.log('Response Body:', responseText);
        if (response.status === 401) {
          localStorage.removeItem('session_id');
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status} ${responseText}`);
        }
        const data = JSON.parse(responseText);
        console.log('Parsed Data:', data);
        setNotifications(data);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [navigate]);

  useEffect(() => {
    console.log('Notifications State Updated:', notifications);
  }, [notifications]);

  const handleFeedbackSubmit = async (id, feedback) => {
    if (!feedback.rating) {
      setError('Please provide a rating (1-5).');
      return;
    }
    try {
      setError(null);
      setSuccess(null);
      const response = await fetch(`http://localhost:8000/notifications/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': localStorage.getItem('session_id'),
        },
        body: JSON.stringify({
          rating: parseInt(feedback.rating),
          comment: feedback.comment || '',
        }),
      });
      console.log('Feedback Submission Status:', response.status);
      const responseText = await response.text();
      console.log('Feedback Submission Body:', responseText);
      if (response.status === 401) {
        localStorage.removeItem('session_id');
        setError('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, feedback: { rating: parseInt(feedback.rating), comment: feedback.comment || '' }, status: 'feedbackProvided' }
            : n
        )
      );
      setSuccess('Feedback submitted successfully!');
    } catch (err) {
      console.error('Feedback Error:', err);
      setError(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        setError(null);
        setSuccess(null);
        const response = await fetch(`http://localhost:8000/notifications/${id}`, {
          method: 'DELETE',
          headers: {
            'X-Session-ID': localStorage.getItem('session_id'),
          },
        });
        console.log('Delete Notification Status:', response.status);
        if (response.status === 401) {
          localStorage.removeItem('session_id');
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setSuccess('Notification deleted successfully!');
      } catch (err) {
        console.error('Delete Error:', err);
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6">
        {/* Sticky Header with Back Button */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="text-white hover:bg-green-800 p-2 rounded-full"
                aria-label="Go back"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Bell className="h-8 w-8" />
              <h1 className="text-2xl sm:text-3xl font-bold">Expert Request Notifications</h1>
            </div>
          </div>
          <p className="mt-2 text-sm opacity-90">View and manage your appointment requests</p>
        </div>

        {/* Loading, Error, and Success States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <p className="ml-2 text-gray-600">Loading notifications...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
            <p>{success}</p>
          </div>
        )}
        {!loading && !error && notifications.length === 0 && (
          <p className="text-gray-600 text-center py-8">No notifications found.</p>
        )}

        {/* Notifications List */}
        <div className="max-w-4xl mx-auto">
          {notifications
            .filter((n) => n.type === 'appointment')
            .map((notification, index) => (
              <div
                key={notification.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <NotificationCard
                  notification={{
                    ...notification,
                    farmerName: notification.farmerName || 'N/A',
                    description: notification.description || 'N/A',
                    status: notification.status || 'N/A',
                    expertName: notification.expertName || 'N/A',
                    expertEmail: notification.expertEmail || 'N/A',
                    expertPhone: notification.expertPhone || 'N/A',
                    declineReason: notification.declineReason || null,
                  }}
                  onFeedbackSubmit={handleFeedbackSubmit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertNotifications;