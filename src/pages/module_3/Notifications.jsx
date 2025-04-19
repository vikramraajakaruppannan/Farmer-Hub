

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, Check, Clock, X, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye } from 'lucide-react';

const initialNotifications = [
  {
    id: 1,
    type: 'expertRequest',
    farmerName: "John Doe",
    query: "Issues with rice paddy leaves showing brown spots",
    description: "Need urgent help with crop health",
    status: "pending",
    expertName: "Dr. Ravi Kumar",
    timestamp: new Date(2025, 3, 18, 14, 30),
    feedback: { rating: 0, comment: '' }
  },
  {
    id: 2,
    type: 'expertRequest',
    farmerName: "Maria Garcia",
    query: "Need guidance on organic pest control methods",
    description: "Looking for sustainable solutions",
    status: "confirmed",
    expertName: "Dr. Sarah Chen",
    timestamp: new Date(2025, 3, 18, 10, 15),
    feedback: { rating: 0, comment: '' }
  },
  {
    id: 3,
    type: 'update',
    message: "New farming webinar scheduled for April 20",
    timestamp: new Date(2025, 3, 19, 9, 0)
  }
];

const NotificationCard = ({ notification, onFeedbackSubmit }) => {
  const [feedback, setFeedback] = useState(notification.feedback || { rating: 0, comment: '' });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <Check className="h-4 w-4" />;
      case 'declined': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    onFeedbackSubmit(notification.id, feedback);
    setIsFeedbackOpen(false);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {notification.type === 'expertRequest' && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{notification.farmerName}</h3>
                  <Badge variant="outline" className={`${getStatusColor(notification.status)} border-0`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(notification.status)}
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2"><strong>{notification.query}</strong></p>
                <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Expert: {notification.expertName}
                </p>
                {notification.status === 'confirmed' && !isFeedbackOpen && (
                  <Button variant="outline" size="sm" onClick={() => setIsFeedbackOpen(true)}>
                    Give Feedback
                  </Button>
                )}
                {isFeedbackOpen && (
                  <form onSubmit={handleFeedbackSubmit} className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 cursor-pointer ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                        />
                      ))}
                    </div>
                    <Input
                      placeholder="Add a comment (optional)"
                      value={feedback.comment}
                      onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    />
                    <Button type="submit" size="sm">Submit Feedback</Button>
                  </form>
                )}
              </>
            )}
            {notification.type === 'update' && (
              <p className="text-sm text-gray-600">{notification.message}</p>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {format(notification.timestamp, 'MMM d, yyyy h:mm a')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    // Load notifications from localStorage on mount
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (storedNotifications.length > 0) {
      setNotifications(storedNotifications);
    } else {
      localStorage.setItem('notifications', JSON.stringify(initialNotifications));
    }

    const interval = setInterval(() => {
      setNotifications(prev => {
        const updated = [...prev];
        updated.forEach(notification => {
          if (notification.status === 'pending' && Math.random() > 0.8) {
            notification.status = 'confirmed';
          } else if (notification.status === 'pending' && Math.random() < 0.2) {
            notification.status = 'declined';
          }
        });
        localStorage.setItem('notifications', JSON.stringify(updated)); // Sync with localStorage
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = (id, feedback) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, feedback, status: 'feedbackProvided' } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated)); // Sync with localStorage
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.status === 'pending' ? { ...n, status: 'read' } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated)); // Sync with localStorage
      return updated;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            </div>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Eye className="h-4 w-4 mr-2" /> Mark as Read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="updates" className="max-w-4xl">
          <TabsList>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="expertRequests">Expert Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="updates">
            {notifications.filter(n => n.type === 'update').map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </TabsContent>
          <TabsContent value="expertRequests">
            {notifications.filter(n => n.type === 'expertRequest').map(notification => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;