// Note: This is a placeholder; the actual page is served by the backend as HTML
// If you prefer a React-based action page, integrate this into your routes
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ExpertRequestAction = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [request, setRequest] = useState(null);
  const [action, setAction] = useState('approve');
  const [declineReason, setDeclineReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`http://localhost:8000/consultation-request/${requestId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch request');
        }
        const data = await response.json();
        setRequest(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load request. Please try again.',
          variant: 'destructive'
        });
      }
    };
    fetchRequest();
  }, [requestId, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (action === 'decline' && !declineReason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for declining.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/consultation-request/${requestId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, decline_reason: declineReason })
      });
      if (!response.ok) {
        throw new Error('Failed to submit action');
      }
      toast({
        title: 'Success',
        description: `Request ${action}d successfully.`
      });
      navigate('/'); // Redirect to homepage or expert dashboard
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit action. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Consultation Request</h1>
        <p><strong>Farmer:</strong> {request.full_name}</p>
        <p><strong>Issue:</strong> {request.issue}</p>
        <p><strong>Crop:</strong> {request.crop_name}</p>
        <p><strong>Location:</strong> {request.location}</p>
        <p><strong>Description:</strong> {request.reason}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="approve">Approve</option>
              <option value="decline">Decline</option>
            </select>
          </div>
          {action === 'decline' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Decline</label>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                rows="4"
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ExpertRequestAction;
