// src/pages/ExpertApproveDecline.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ExpertApproveDecline = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/appointment_requests?token=${token}`);
        if (!response.ok) throw new Error('Failed to load request');
        const data = await response.json();
        if (!data) throw new Error('Invalid or expired link');
        setRequest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [token]);

  const handleAction = async (action) => {
    if (submitting) return;
    if (action === 'decline' && !declineReason.trim()) {
      setError('Reason required for decline.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/appointment_requests/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action,
          decline_reason: action === 'decline' ? declineReason : null,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action}`);

      setActionStatus(action);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100">
        <div className="flex items-center gap-3">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (actionStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Request {actionStatus}d</h2>
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Leaf className="h-8 w-8 text-emerald-600" />
          Appointment Request
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-3 text-gray-700">
            <p><strong>Farmer:</strong> {request.full_name}</p>
            <p><strong>Crop:</strong> {request.crop_name}</p>
            <p><strong>Issue:</strong> {request.issue}</p>
            <p><strong>Location:</strong> {request.location}</p>
            <p><strong>Mobile:</strong> {request.mobile}</p>
            <p><strong>Description:</strong> {request.reason}</p>
            <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleString()}</p>
          </div>

          {error && (
            <div className="mt-6 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Button
              onClick={() => handleAction('approve')}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Submitting...' : 'Approve Request'}
            </Button>

            <div>
              <Input
                placeholder="Reason for declining (required)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="mb-3"
              />
              <Button
                onClick={() => handleAction('decline')}
                disabled={submitting}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                {submitting ? 'Submitting...' : 'Decline Request'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertApproveDecline;