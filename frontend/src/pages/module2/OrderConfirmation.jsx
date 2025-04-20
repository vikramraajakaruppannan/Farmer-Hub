import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { CheckCircle, Package, Truck, ShoppingBag, Download, ArrowLeft, MapPin, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

// Progress Tracker Component
const ProgressTracker = ({ status }) => {
  const statusMap = {
    Pending: 'placed',
    Packed: 'processing',
    Shipped: 'shipped',
    Delivered: 'delivered',
    Cancelled: 'cancelled',
  };
  const normalizedStatus = statusMap[status] || status.toLowerCase();
  const statuses = ['placed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(normalizedStatus);

  return (
    <div className="flex items-center justify-between w-full mt-4">
      {statuses.map((step, index) => (
        <div key={step} className="flex-1 text-center">
          <div className="relative">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                index <= currentIndex ? 'bg-agritech-green text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index <= currentIndex ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-1 ${
                  index < currentIndex ? 'bg-agritech-green' : 'bg-gray-200'
                }`}
              />
            )}
            <p className="mt-2 text-xs capitalize text-gray-600">{step}</p>
          </div>
        </div>
      ))}
      {normalizedStatus === 'cancelled' && (
        <div className="flex-1 text-center">
          <div className="relative">
            <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center bg-red-500 text-white">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="mt-2 text-xs capitalize text-gray-600">Cancelled</p>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/orders/${id}`, {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      console.log('Order Response:', response.data); // Log for debugging
      setOrder(response.data);
      toast({
        title: 'Order Placed Successfully!',
        description: `Order #${id} has been confirmed and is being processed.`,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
      if (e.response?.status === 401) navigate('/login');
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('AgriTech - Invoice', 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Order #: ${order.id}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text('Product Details:', 20, 70);
    (order.products || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - Qty: ${item.quantity} - ₹${item.price}`, 25, 80 + index * 10);
    });
    doc.text('Delivery Information:', 20, 100 + (order.products?.length || 0) * 10);
    doc.text(`Name: ${order.delivery.full_name}`, 25, 110 + (order.products?.length || 0) * 10);
    doc.text(`Address: ${order.delivery.address}`, 25, 120 + (order.products?.length || 0) * 10);
    doc.text(`City: ${order.delivery.city}, ${order.delivery.state} ${order.delivery.pin_code}`, 25, 130 + (order.products?.length || 0) * 10);
    doc.text(`Phone: ${order.delivery.phone_number}`, 25, 140 + (order.products?.length || 0) * 10);
    doc.text(`Delivery Method: ${order.delivery_method === 'self_pickup' ? 'Self Pickup' : 'Parcel'}`, 25, 150 + (order.products?.length || 0) * 10);
    if (order.pickup_time && order.delivery_method === 'self_pickup') {
      doc.text(`Pickup Time: ${new Date(order.pickup_time).toLocaleString()}`, 25, 160 + (order.products?.length || 0) * 10);
    }
    doc.text('Payment Details:', 20, 180 + (order.products?.length || 0) * 10);
    doc.text(`Payment Method: ${order.payment_method === 'upi' ? 'UPI (GPay)' : 'Pay on Delivery'}`, 25, 190 + (order.products?.length || 0) * 10);
    doc.text(`Subtotal: ₹${order.total_price ? (order.total_price - 40).toFixed(2) : '0.00'}`, 25, 200 + (order.products?.length || 0) * 10);
    doc.text(`Delivery Fee: ₹40`, 25, 210 + (order.products?.length || 0) * 10);
    doc.text(`Total Amount: ₹${order.total_price ? order.total_price.toFixed(2) : '0.00'}`, 25, 220 + (order.products?.length || 0) * 10);
    doc.setFontSize(10);
    doc.text('Thank you for shopping with AgriTech!', 20, 260);
    doc.save(`AgriTech_Invoice_${order.id}.pdf`);
    toast({
      title: 'Invoice Downloaded',
      description: 'Your invoice has been downloaded successfully.',
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!order) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              className="p-2 hover:bg-gray-200 rounded-full"
              onClick={handleGoBack}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-agritech-darkGreen" />
            </Button>
            <h1 className="text-3xl font-bold text-agritech-darkGreen">Order Confirmation</h1>
          </div>

          {/* Main Card */}
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden rounded-xl shadow-lg animate-in fade-in duration-300">
              <CardHeader className="bg-agritech-paleGreen p-6 text-center">
                <CheckCircle className="h-16 w-16 text-agritech-green mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-agritech-darkGreen mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <p className="text-lg font-semibold text-agritech-green mt-2">
                  Order #{order.id}
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${
                    order.status.toLowerCase() === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status.toLowerCase() === 'shipped'
                      ? 'bg-blue-100 text-blue-700'
                      : order.status.toLowerCase() === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  Status: {order.status}
                </span>
              </CardHeader>
              <CardContent className="p-6">
                {/* Progress Tracker */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-agritech-darkGreen mb-3">Order Progress</h2>
                  <ProgressTracker status={order.status} />
                </div>

                {/* Order Details */}
                <div className="space-y-6">
                  {/* Products */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold text-agritech-darkGreen">Order Items</h2>
                      <Button
                        variant="link"
                        className="text-agritech-green hover:text-agritech-darkGreen p-0"
                        onClick={() => setExpandedSection(expandedSection === 'items' ? null : 'items')}
                        aria-expanded={expandedSection === 'items'}
                        aria-controls="order-items"
                      >
                        {expandedSection === 'items' ? 'Hide Items' : 'Show Items'}
                      </Button>
                    </div>
                    {expandedSection === 'items' && (
                      <div id="order-items" className="space-y-4">
                        {Array.isArray(order.products) && order.products.length > 0 ? (
                          order.products.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <img
                                src={item.image || '/fallback-image.png'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md mr-3"
                                onError={(e) => (e.target.src = '/fallback-image.png')}
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-agritech-darkGreen">{item.name}</h3>
                                <p className="text-sm text-gray-600">Qty: {item.quantity} units</p>
                                <p className="text-sm font-semibold text-agritech-green">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No items found in this order.</p>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Subtotal: ₹{order.total_price ? (order.total_price - 40).toFixed(2) : '0.00'}
                          </p>
                          <p className="text-sm text-gray-600">Delivery Fee: ₹40.00</p>
                          <p className="text-lg font-semibold text-agritech-darkGreen">
                            Total: ₹{order.total_price ? order.total_price.toFixed(2) : '0.00'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Delivery Information */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold text-agritech-darkGreen">Delivery Information</h2>
                      <Button
                        variant="link"
                        className="text-agritech-green hover:text-agritech-darkGreen p-0"
                        onClick={() => setExpandedSection(expandedSection === 'delivery' ? null : 'delivery')}
                        aria-expanded={expandedSection === 'delivery'}
                        aria-controls="delivery-info"
                      >
                        {expandedSection === 'delivery' ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                    {expandedSection === 'delivery' && (
                      <div id="delivery-info" className="space-y-2">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-agritech-green mr-3" />
                          <div>
                            <p className="font-medium text-agritech-darkGreen">{order.delivery.full_name}</p>
                            <p className="text-sm text-gray-600">{order.delivery.address}</p>
                            <p className="text-sm text-gray-600">
                              {order.delivery.city}, {order.delivery.state} {order.delivery.pin_code}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {order.delivery.phone_number}</p>
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
                    )}
                  </div>

                  <Separator />

                  {/* Payment Information */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold text-agritech-darkGreen">Payment Information</h2>
                      <Button
                        variant="link"
                        className="text-agritech-green hover:text-agritech-darkGreen p-0"
                        onClick={() => setExpandedSection(expandedSection === 'payment' ? null : 'payment')}
                        aria-expanded={expandedSection === 'payment'}
                        aria-controls="payment-info"
                      >
                        {expandedSection === 'payment' ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                    {expandedSection === 'payment' && (
                      <div id="payment-info" className="flex items-center">
                        <ShoppingBag className="h-5 w-5 text-agritech-green mr-3" />
                        <div>
                          <p className="font-medium">Payment Method</p>
                          <p className="text-sm text-gray-600">
                            {order.payment_method === 'upi' ? 'UPI (GPay)' : 'Pay on Delivery'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-agritech-green hover:bg-agritech-darkGreen flex-1 transition-transform hover:scale-105"
                        onClick={() => navigate('/track-orders')}
                      >
                        Track Your Order
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                      View order status and tracking details
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-agritech-green text-agritech-green hover:bg-agritech-paleGreen flex-1 transition-transform hover:scale-105"
                        onClick={handleDownloadInvoice}
                      >
                        <Download className="h-4 w-4 mr-2" /> Download Invoice
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                      Download PDF invoice for this order
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Continue Shopping */}
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-agritech-green hover:text-agritech-darkGreen hover:bg-agritech-paleGreen"
                  onClick={() => navigate('/market')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>

            {/* Promotional Banner */}
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
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default OrderConfirmation;