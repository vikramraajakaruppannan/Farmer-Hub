import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Phone, MapPin, Leaf, ClipboardList, Check, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AppointmentModal = ({ expert, onClose }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    location: '',
    cropName: '',
    issue: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        return value.match(/^[A-Za-z\s]+$/) ? '' : 'Name should only contain letters';
      case 'mobile':
        return value.match(/^\d{10}$/) ? '' : 'Phone number should be 10 digits';
      case 'issue':
        return value.trim() ? '' : 'Please select an issue';
      case 'reason':
        return value.length >= 15 ? '' : 'Description should be at least 15 characters';
      default:
        return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      mobile: validateField('mobile', formData.mobile),
      location: formData.location.trim() ? '' : 'Location is required',
      cropName: formData.cropName.trim() ? '' : 'Crop name is required',
      issue: validateField('issue', formData.issue),
      reason: validateField('reason', formData.reason),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/appointment_requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': localStorage.getItem('session_id'),
        },
        body: JSON.stringify({
          expert_id: expert.id,
          full_name: formData.fullName,
          mobile: formData.mobile,
          location: formData.location,
          crop_name: formData.cropName,
          issue: formData.issue,
          reason: formData.reason,
        }),
      });
      console.log('Appointment Request Status:', response.status);
      const responseText = await response.text();
      console.log('Appointment Request Body:', responseText);
      if (response.status === 401) {
        localStorage.removeItem('session_id');
        setError('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to submit appointment request');
      }
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/expert-notifications');
      }, 3000);
    } catch (err) {
      console.error('Submit Error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-green-50 to-white rounded-xl shadow-2xl animate-slide-up">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100 z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
              <Check className="relative h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
              Your appointment request has been sent to {expert.name}. You'll be notified once they respond.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  onClose();
                  navigate('/expert-notifications');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Bell className="h-4 w-4" /> View Notifications
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-green-500 text-green-500 hover:bg-green-50"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white rounded-xl shadow-2xl p-6 animate-slide-up">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Appointment with {expert.name}
          </DialogTitle>
          
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Appointment request form">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter your full name"
                  className={`pl-10 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter your mobile number"
                  className={`pl-10 ${errors.mobile ? 'border-red-500 focus:ring-red-500' : ''}`}
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  required
                  aria-invalid={!!errors.mobile}
                  aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                />
              </div>
              {errors.mobile && (
                <p id="mobile-error" className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter your location"
                  className={`pl-10 ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                />
              </div>
              {errors.location && (
                <p id="location-error" className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <div className="relative">
                <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter crop name"
                  className={`pl-10 ${errors.cropName ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.cropName}
                  onChange={(e) => handleInputChange('cropName', e.target.value)}
                  required
                  aria-invalid={!!errors.cropName}
                  aria-describedby={errors.cropName ? 'cropName-error' : undefined}
                />
              </div>
              {errors.cropName && (
                <p id="cropName-error" className="text-red-500 text-xs mt-1">{errors.cropName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
              <div className="relative">
                <Select
                  value={formData.issue}
                  onValueChange={(value) => handleInputChange('issue', value)}
                  required
                  aria-invalid={!!errors.issue}
                  aria-describedby={errors.issue ? 'issue-error' : undefined}
                >
                  <SelectTrigger className={`pl-10 ${errors.issue ? 'border-red-500 focus:ring-red-500' : ''}`}>
                    <ClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select an issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disease">Crop Disease</SelectItem>
                    <SelectItem value="pest">Pest Infestation</SelectItem>
                    <SelectItem value="soil">Soil Problems</SelectItem>
                    <SelectItem value="irrigation">Irrigation Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.issue && (
                <p id="issue-error" className="text-red-500 text-xs mt-1">{errors.issue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Consultation{' '}
                <span className="text-gray-400 text-xs">
                  ({formData.reason.length}/15)
                </span>
              </label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  placeholder="Describe your issue in detail"
                  className={`pl-10 min-h-[100px] ${errors.reason ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  required
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? 'reason-error' : undefined}
                />
              </div>
              {errors.reason && (
                <p id="reason-error" className="text-red-500 text-xs mt-1">{errors.reason}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md" role="alert">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
              aria-label="Submit appointment request"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;