import React from 'react';
import './RequestDetail.css';

const RequestDetail = ({ request, onBack, onAccept, onIgnore }) => {
  if (!request) {
    return (
      <div className="min-h-screen bg-[#F8FFF8] flex items-center justify-center">
        No request selected
      </div>
    );
  }

  const getTimeSincePosted = (createdAt) => {
    try {
      if (!createdAt) return 'Posted recently';
      const now = new Date();
      const posted = new Date(createdAt);
      if (isNaN(posted.getTime())) return 'Posted recently';
      const diffMs = now - posted;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 60) return `Posted ${diffMin} min ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `Posted ${diffHr} hr ago`;
      const diffDay = Math.floor(diffHr / 24);
      return `Posted ${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error calculating time since posted:', error);
      return 'Posted recently';
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="text-gray-600 flex items-center gap-2 hover:text-gray-800"
        >
          ← Back to Requests
        </button>
        <span className="text-sm text-gray-500">{getTimeSincePosted(request.created_at)}</span>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Product</p>
            <p className="text-gray-800 font-medium">{request.product_name || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Request ID</p>
            <p className="text-gray-800 font-medium">#{request.id || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="text-gray-800 font-medium">
              {request.quantity && request.unit ? `${request.quantity} ${request.unit}` : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Delivery Deadline</p>
            <p className="text-gray-800 font-medium">
              {request.requiredDateTime
                ? new Date(request.requiredDateTime).toLocaleDateString()
                : 'Not specified'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-gray-800 font-medium">Buyer Details</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-lg">
                {request.buyers?.first_name?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <p className="text-gray-800 font-medium">{request.buyers?.first_name || 'N/A'}</p>
              <p className="text-sm text-gray-500">
                ⭐ {request.buyers?.orders_count || 0} orders
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-gray-800 font-medium">Additional Notes</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {request.notes || 'No additional notes provided.'}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-gray-800 font-medium">Delivery Location</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {request.deliveryLocation || request.buyers?.location || 'Not specified'}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Accept Request
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;