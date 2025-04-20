import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Package, Truck, ShoppingBag, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Progress Tracker Component
const ProgressTracker = ({ status, deliveryMethod }) => {
  const statuses = deliveryMethod === 'self_pickup'
    ? ['Pending', 'Ready for Pickup', 'Delivered']
    : ['Pending', 'Packed', 'Shipped', 'Delivered'];
  const currentIndex = statuses.indexOf(status);
  const isCancelled = status === 'Cancelled';

  return (
    <div className="flex items-center justify-between w-full mt-4">
      {statuses.map((step, index) => (
        <div key={step} className="flex-1 text-center">
          <div className="relative">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                isCancelled
                  ? 'bg-red-500 text-white'
                  : index <= currentIndex
                  ? 'bg-agritech-green text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isCancelled ? (
                <XCircle className="w-5 h-5" />
              ) : index <= currentIndex ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-1 ${
                  isCancelled
                    ? 'bg-red-200'
                    : index < currentIndex
                    ? 'bg-agritech-green'
                    : 'bg-gray-200'
                }`}
              />
            )}
            <p className="mt-2 text-xs text-gray-600">{step}</p>
          </div>
        </div>
      ))}
      {isCancelled && (
        <div className="flex-1 text-center">
          <div className="relative">
            <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center bg-red-500 text-white">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="mt-2 text-xs text-gray-600">Cancelled</p>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Valid status transitions (matching backend)
  const validTransitions = {
    self_pickup: {
      Pending: ['Ready for Pickup', 'Cancelled'],
      'Ready for Pickup': ['Delivered'],
      Delivered: [],
      Cancelled: [],
    },
    parcel: {
      Pending: ['Packed', 'Cancelled'],
      Packed: ['Shipped'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/orders', {
          headers: { 'X-Session-ID': localStorage.getItem('session_id') },
        });
        setOrders(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        });
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [navigate, toast]);

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      const order = orders.find((o) => o.id === cancelOrderId);
      if (!order) {
        throw new Error('Order not found');
      }
      const currentStatus = order.status;
      const deliveryMethod = order.delivery_method;

      // Validate status transition
      if (!validTransitions[deliveryMethod][currentStatus]?.includes('Cancelled')) {
        toast({
          title: 'Invalid Action',
          description: `Cannot cancel order in ${currentStatus} status`,
          variant: 'destructive',
        });
        return;
      }

      await axios.put(
        `http://localhost:8000/orders/${cancelOrderId}/status`,
        { status: 'Cancelled' },
        { headers: { 'X-Session-ID': localStorage.getItem('session_id') } }
      );
      setShowCancelConfirm(false);
      setCancelOrderId(null);
      // Refresh orders
      const response = await axios.get('http://localhost:8000/orders', {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      setOrders(response.data);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
    } catch (error) {
      let errorMessage = 'Failed to cancel order';
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to cancel this order';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="p-2 hover:bg-gray-200 rounded-full"
                onClick={handleGoBack}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-agritech-darkGreen" />
              </Button>
              <h1 className="text-3xl font-bold text-agritech-darkGreen">Track Your Orders</h1>
            </div>
            <Button
              className="bg-agritech-green hover:bg-agritech-darkGreen"
              onClick={() => navigate('/market')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Shop More
            </Button>
          </div>

          {/* Orders List */}
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <svg
                  className="animate-spin h-10 w-10 text-agritech-green"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Found</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't placed any orders yet. Start shopping to track your orders here!
                </p>
                <Button
                  className="bg-agritech-green hover:bg-agritech-darkGreen"
                  onClick={() => navigate('/market')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" /> Start Shopping
                </Button>
              </div>
            ) : (
              <Card className="overflow-hidden rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs uppercase bg-gray-100 text-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3">Order ID</th>
                        <th scope="col" className="px-6 py-3">Placed On</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Delivery Method</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr
                            className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          >
                            <td className="px-6 py-4 font-medium">#{order.id}</td>
                            <td className="px-6 py-4">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      order.status === 'Delivered'
                                        ? 'bg-green-100 text-green-700'
                                        : order.status === 'Shipped' || order.status === 'Ready for Pickup'
                                        ? 'bg-blue-100 text-blue-700'
                                        : order.status === 'Cancelled'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                  Current order status
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-6 py-4">
                              {order.delivery_method === 'self_pickup' ? 'Self Pickup' : 'Parcel'}
                            </td>
                            <td className="px-6 py-4">
                              ₹{order.total_price ? order.total_price.toFixed(2) : order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="link"
                                    className="text-agritech-green hover:text-agritech-darkGreen p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOrder(expandedOrder === order.id ? null : order.id);
                                    }}
                                  >
                                    {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                  View order details
                                </TooltipContent>
                              </Tooltip>
                              {['Pending'].includes(order.status) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 border-red-500 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelOrderId(order.id);
                                        setShowCancelConfirm(true);
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                    Cancel this order
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </td>
                          </tr>
                          {expandedOrder === order.id && (
                            <tr>
                              <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                <div className="space-y-6">
                                  {/* Progress Tracker */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-agritech-darkGreen mb-2">
                                      Order Progress
                                    </h4>
                                    <ProgressTracker
                                      status={order.status}
                                      deliveryMethod={order.delivery_method}
                                    />
                                  </div>

                                  {/* Order Items */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-agritech-darkGreen mb-2">
                                      Items
                                    </h4>
                                    <div className="space-y-4">
                                      {order.products.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex items-start bg-gray-50 p-3 rounded-lg"
                                        >
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-md mr-3"
                                            onError={(e) => (e.target.src = '/fallback-image.png')}
                                          />
                                          <div className="flex-1">
                                            <h5 className="font-medium text-agritech-darkGreen">{item.name}</h5>
                                            <p className="text-sm text-gray-600">
                                              Qty: {item.quantity} units
                                            </p>
                                            <p className="text-sm font-semibold text-agritech-green">
                                              ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                      <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                          Subtotal: ₹{(order.total_price - 40).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-600">Delivery Fee: ₹40.00</p>
                                        <p className="text-lg font-semibold text-agritech-darkGreen">
                                          Total: ₹{order.total_price.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delivery Information */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-agritech-darkGreen mb-2">
                                      Delivery Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <Package className="h-5 w-5 text-agritech-green mr-3" />
                                        <div>
                                          <p className="font-medium text-agritech-darkGreen">
                                            {order.delivery.full_name}
                                          </p>
                                          <p className="text-sm text-gray-600">{order.delivery.address}</p>
                                          <p className="text-sm text-gray-600">
                                            {order.delivery.city}, {order.delivery.state}{' '}
                                            {order.delivery.pin_code}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Phone: {order.delivery.phone_number}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        <Truck className="h-5 w-5 text-agritech-green mr-3" />
                                        <div>
                                          <p className="font-medium">Delivery Method</p>
                                          <p className="text-sm text-gray-600">
                                            {order.delivery_method === 'self_pickup' ? 'Self Pickup' : 'Parcel'}
                                          </p>
                                          {order.pickup_time && order.delivery_method === 'self_pickup' && (
                                            <p className="text-sm text-gray-600">
                                              Pickup Time:{' '}
                                              {new Date(order.pickup_time).toLocaleString('en-US', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                              })}
                                            </p>
                                          )}
                                          {order.tracking_link && order.delivery_method === 'parcel' && (
                                            <p className="text-sm text-gray-600">
                                              Tracking:{' '}
                                              <a
                                                href={order.tracking_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-agritech-green underline hover:text-agritech-darkGreen"
                                              >
                                                Track Package
                                              </a>
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-agritech-darkGreen mb-2">
                                      Payment Information
                                    </h4>
                                    <div className="flex items-center">
                                      <ShoppingBag className="h-5 w-5 text-agritech-green mr-3" />
                                      <div>
                                        <p className="font-medium">Payment Method</p>
                                        <p className="text-sm text-gray-600">
                                          {order.payment_method === 'upi' ? 'UPI (GPay)' : 'Pay on Delivery'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Promotional Banner */}
            {orders.length > 0 && (
              <div className="mt-8 bg-agritech-green text-white rounded-lg p-6 shadow-lg text-center">
                <h2 className="text-xl font-semibold mb-2">Explore More Products!</h2>
                <p className="text-sm mb-4">Discover our wide range of agricultural products and keep shopping.</p>
                <Button
                  className="bg-white text-agritech-green hover:bg-gray-100"
                  onClick={() => navigate('/market')}
                >
                  Shop Now
                </Button>
              </div>
            )}
          </div>

          {/* Cancel Confirmation Dialog */}
          <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl text-agritech-darkGreen">Cancel Order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Cancelling the order will notify the seller and update the order status.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleCancelOrder}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                  ) : null}
                  {isLoading ? 'Cancelling...' : 'Cancel Order'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TrackOrders;
