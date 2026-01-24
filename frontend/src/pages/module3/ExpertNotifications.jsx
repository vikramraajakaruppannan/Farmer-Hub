// src/pages/FarmerNotifications.jsx
import React, { useState, useEffect } from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import NotificationCard from '@/components/expert/NotificationCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
          setError('No session found. Please log in.');
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/notifications`, {
          headers: { 'X-Session-ID': sessionId },
        });

        if (response.status === 401) {
          localStorage.removeItem('session_id');
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch: ${response.status} ${text}`);
        }

        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleFeedbackSubmit = async (id, feedback) => {
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      setError('Rating must be 1–5.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`${API_BASE}/notifications/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          rating: parseInt(feedback.rating),
          comment: feedback.comment || '',
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('session_id');
        setError('Session expired.');
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to submit feedback');

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: 'feedbackProvided',
                feedback: { rating: parseInt(feedback.rating), comment: feedback.comment || '' },
              }
            : n
        )
      );
      setSuccess('Thank you! Feedback submitted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      setError(null);
      setSuccess(null);
      const sessionId = localStorage.getItem('session_id');
      const response = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'X-Session-ID': sessionId },
      });

      if (response.status === 401) {
        localStorage.removeItem('session_id');
        setError('Session expired.');
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete');

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSuccess('Notification deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="text-white hover:bg-green-800 p-2 rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Bell className="h-8 w-8" />
              <h1 className="text-2xl sm:text-3xl font-bold">My Appointment Notifications</h1>
            </div>
          </div>
          <p className="mt-2 text-sm opacity-90">Track your expert consultation requests</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <p className="ml-2 text-gray-600">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6">
            <p>{success}</p>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <p className="text-gray-600 text-center py-8">No notifications yet.</p>
        )}

        <div className="max-w-4xl mx-auto">
          {notifications
            .filter((n) => n.type === 'appointment')
            .map((n, i) => (
              <div key={n.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in">
                <NotificationCard
                  notification={{
                    ...n,
                    farmerName: n.farmerName ?? '—',
                    description: n.description ?? '—',
                    status: n.status ?? '—',
                    expertName: n.expertName ?? '—',
                    expertEmail: n.expertEmail ?? null,
                    expertPhone: n.expertPhone ?? null,
                    declineReason: n.declineReason ?? null,
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