import React, { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const NotificationCard = ({ notification, onFeedbackSubmit, onDelete }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [feedbackError, setFeedbackError] = useState(null);

  const handleSubmitFeedback = () => {
    if (!rating) {
      setFeedbackError('Please select a rating (1-5).');
      return;
    }
    if (rating < 1 || rating > 5) {
      setFeedbackError('Rating must be between 1 and 5.');
      return;
    }
    setFeedbackError(null);
    onFeedbackSubmit(notification.id, { rating, comment });
    setRating('');
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-2">
        <p className="text-gray-800"><strong>Farmer:</strong> {notification.farmerName}</p>
        <p className="text-gray-800"><strong>Issue:</strong> {notification.description}</p>
        <p className="text-gray-800"><strong>Status:</strong> {notification.status}</p>
        {notification.status === 'confirmed' && (
          <>
            <p className="text-gray-800"><strong>Expert:</strong> {notification.expertName}</p>
            <p className="text-gray-800"><strong>Email:</strong> {notification.expertEmail}</p>
            <p className="text-gray-800"><strong>Phone:</strong> {notification.expertPhone}</p>
          </>
        )}
        {notification.declineReason && (
          <p className="text-gray-800"><strong>Decline Reason:</strong> {notification.declineReason}</p>
        )}
        {notification.feedback?.rating && (
          <div className="mt-2">
            <p className="text-gray-800"><strong>Feedback:</strong> {notification.feedback.rating}/5</p>
            {notification.feedback.comment && (
              <p className="text-gray-800"><strong>Comment:</strong> {notification.feedback.comment}</p>
            )}
          </div>
        )}
      </div>

      {notification.status === 'confirmed' && !notification.feedback?.rating && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Provide Feedback</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating (1-5)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Enter rating"
                  className="w-20"
                  aria-label="Feedback rating"
                />
                <Star className="h-4 w-4 text-yellow-400" />
              </div>
              {feedbackError && <p className="text-red-500 text-xs mt-1">{feedbackError}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Comment (Optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback..."
                className="min-h-[80px]"
                aria-label="Feedback comment"
              />
            </div>
            <Button
              onClick={handleSubmitFeedback}
              className="bg-green-600 hover:bg-green-700 text-white"
              aria-label="Submit feedback"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => onDelete(notification.id)}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2"
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default NotificationCard;