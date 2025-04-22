import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ExpertApproveDecline = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8000/appointment_requests?token=${token}`);
        console.log('Fetch Request Status:', response.status);
        const responseText = await response.text();
        console.log('Fetch Request Body:', responseText);
        if (!response.ok) {
          throw new Error('Failed to fetch request');
        }
        const data = JSON.parse(responseText);
        if (data.length === 0) {
          throw new Error('Invalid or expired token');
        }
        setRequest(data[0]);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [token]);

  const handleAction = async (action) => {
    if (action === 'decline' && !declineReason.trim()) {
      setError('Please provide a reason for declining.');
      return;
    }

    try {
      setError(null);
      const response = await fetch('http://localhost:8000/appointment_requests/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          action,
          decline_reason: action === 'decline' ? declineReason : null,
        }),
      });
      console.log('Action Request Status:', response.status);
      const responseText = await response.text();
      console.log('Action Request Body:', responseText);
      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }
      setActionStatus(action);
      setTimeout(() => {
        navigate('/expert-notifications');
      }, 3000);
    } catch (err) {
      console.error('Action Error:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100">
        <div className="flex items-center gap-3">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
          <p className="text-gray-700 text-lg font-sans">Loading request...</p>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100">
        <div className="bg-cream-50 border-l-4 border-rose-500 text-rose-700 p-6 rounded-lg max-w-md shadow-md animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-serif text-rose-800">Error</h2>
          </div>
          <p className="font-sans">{error}</p>
        </div>
      </div>
    );
  }

  if (actionStatus) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100">
        <div className="bg-cream-50 rounded-lg shadow-xl p-8 max-w-md text-center animate-slide-up border border-gold-200">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse"></div>
            <CheckCircle className="relative h-8 w-8 text-gold-600" />
          </div>
          <h2 className="text-2xl font-serif text-gray-800 mb-2">
            Request {actionStatus.charAt(0).toUpperCase() + actionStatus.slice(1)}d
          </h2>
          <p className="text-gray-600 mb-6 font-sans">
            The appointment request has been {actionStatus}d successfully...
          </p>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cream-100 py-12">
      <div className="max-w-md mx-auto px-4">
        <h1
          className="text-3xl sm:text-4xl font-serif text-gray-800 mb-8 flex items-center gap-3 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-24 after:h-1 after:bg-gradient-to-r after:from-emerald-600 after:to-gold-400"
        >
          <Leaf className="h-8 w-8 text-emerald-600" />
          Appointment Request
        </h1>
        <div className="bg-cream-50 rounded-lg shadow-xl p-8 animate-scale-in border border-gold-200">
          <h2 className="text-xl font-serif text-gray-800 mb-5">Request Details</h2>
          <div className="space-y-4 text-gray-600 font-sans">
            <p><strong className="text-gray-800">Farmer:</strong> {request.full_name}</p>
            <p><strong className="text-gray-800">Issue:</strong> {request.issue}</p>
            <p><strong className="text-gray-800">Crop:</strong> {request.crop_name}</p>
            <p><strong className="text-gray-800">Location:</strong> {request.location}</p>
            <p><strong className="text-gray-800">Mobile:</strong> {request.mobile}</p>
            <p><strong className="text-gray-800">Description:</strong> {request.reason}</p>
            <p><strong className="text-gray-800">Submitted:</strong> {new Date(request.created_at).toLocaleString()}</p>
          </div>
          <div className="mt-8 space-y-5">
            {error && (
              <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 rounded-md animate-slide-up" role="alert">
                {error}
              </div>
            )}
            <Button
              onClick={() => handleAction('approve')}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-md transition-all duration-300 hover:scale-105"
              aria-label="Approve appointment request"
            >
              Approve Request
            </Button>
            <div>
              <Input
                placeholder="Reason for declining (required)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="mb-3 rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Reason for declining"
              />
              <Button
                onClick={() => handleAction('decline')}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-md transition-all duration-300 hover:scale-105"
                aria-label="Decline appointment request"
              >
                Decline Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertApproveDecline;