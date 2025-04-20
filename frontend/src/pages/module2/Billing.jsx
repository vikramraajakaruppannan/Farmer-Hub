import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { CheckCircle, MapPin, Truck, ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Checkout Progress Bar Component
const CheckoutProgress = ({ currentStep }) => {
  const steps = ['Cart', 'Delivery', 'Billing', 'Confirmation'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex-1 text-center">
          <div className="relative">
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                index <= currentIndex ? 'bg-agritech-green text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index <= currentIndex ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
            </div>
            {index < steps.length - 1 && (
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
    </div>
  );
};

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const deliveryData = JSON.parse(localStorage.getItem('delivery') || '{}');

    if (!cartData.length) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before proceeding.',
        variant: 'destructive',
      });
      navigate('/market');
      return;
    }
    if (
      !cartData.every((item) =>
        item.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
      )
    ) {
      setErrors({ cart: 'Invalid cart data. Please update your cart.' });
      return;
    }

    const requiredFields = ['full_name', 'phone_number', 'address', 'city', 'state', 'pin_code', 'delivery_method'];
    const deliveryErrors = {};
    requiredFields.forEach((field) => {
      if (!deliveryData[field]) {
        deliveryErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });
    if (deliveryData.phone_number && !/^\d{10}$/.test(deliveryData.phone_number)) {
      deliveryErrors.phone_number = 'Phone number must be 10 digits';
    }
    if (deliveryData.pin_code && !/^\d{6}$/.test(deliveryData.pin_code)) {
      deliveryErrors.pin_code = 'Pin code must be 6 digits';
    }
    if (deliveryData.full_name && deliveryData.full_name.length > 100) {
      deliveryErrors.full_name = 'Full name must be under 100 characters';
    }
    if (deliveryData.address && deliveryData.address.length > 200) {
      deliveryErrors.address = 'Address must be under 200 characters';
    }
    if (deliveryData.city && deliveryData.city.length > 50) {
      deliveryErrors.city = 'City must be under 50 characters';
    }
    if (deliveryData.state && deliveryData.state.length > 50) {
      deliveryErrors.state = 'State must be under 50 characters';
    }
    if (deliveryData.delivery_method && !['self_pickup', 'parcel'].includes(deliveryData.delivery_method)) {
      deliveryErrors.delivery_method = 'Invalid delivery method';
    }

    if (Object.keys(deliveryErrors).length > 0) {
      setErrors(deliveryErrors);
      toast({
        title: 'Invalid Delivery Info',
        description: 'Please complete your delivery details.',
        variant: 'destructive',
      });
      navigate('/delivery');
      return;
    }

    setCart(cartData);
    setDeliveryInfo(deliveryData);
  }, [navigate, toast]);

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const productIds = cart.map((item) => item.id);
      const productsResponse = await axios.get('http://localhost:8000/products', {
        params: { ids: productIds.join(',') },
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      const productDict = productsResponse.data.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      for (const item of cart) {
        const dbProduct = productDict[item.id];
        if (!dbProduct) {
          throw new Error(`Product not found: ${item.name}`);
        }
        if (item.quantity > dbProduct.quantity) {
          throw new Error(`Only ${dbProduct.quantity} units available for ${item.name}`);
        }
        if (Math.abs(item.price - dbProduct.price) > 0.01) {
          throw new Error(`Price for ${item.name} has changed to ₹${dbProduct.price}`);
        }
      }

      const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = deliveryInfo.delivery_method === 'parcel' ? 40 : 0;
      const total = itemsTotal + deliveryFee;

      const order = {
        products: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
        delivery: deliveryInfo,
        delivery_method: deliveryInfo.delivery_method,
        payment_method: paymentMethod,
        pickup_time: deliveryInfo.delivery_method === 'self_pickup' ? new Date().toISOString() : null,
        tracking_link: null,
      };
      const response = await axios.post('http://localhost:8000/orders', order, {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      localStorage.removeItem('cart');
      localStorage.removeItem('delivery');
      toast({
        title: 'Success',
        description: 'Order placed successfully',
      });
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (e) {
      console.error('Place order error:', e);
      toast({
        title: 'Error',
        description: e.response?.data?.detail || e.message || 'Failed to place order',
        variant: 'destructive',
      });
      if (e.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/delivery');
  };

  if (!cart.length || !deliveryInfo || Object.keys(errors).length > 0) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Card className="rounded-xl shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-red-500 font-semibold mb-4">
                {errors.cart || 'Invalid order details. Please check your cart and delivery information.'}
              </p>
              <Button
                className="bg-agritech-green hover:bg-agritech-darkGreen transition-transform hover:scale-105"
                onClick={() => navigate('/delivery')}
              >
                Return to Delivery
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryInfo.delivery_method === 'parcel' ? 40 : 0;
  const total = itemsTotal + deliveryFee;

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              className="p-2 hover:bg-gray-200 rounded-full"
              onClick={handleGoBack}
              aria-label="Back to Delivery"
            >
              <ArrowLeft className="h-5 w-5 text-agritech-darkGreen" />
            </Button>
            <h1 className="text-3xl font-bold text-agritech-darkGreen">Billing & Payment</h1>
          </div>

          <div className="max-w-5xl mx-auto">
            <CheckoutProgress currentStep="Billing" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden rounded-xl shadow-lg animate-in fade-in duration-300">
                  <CardHeader className="bg-agritech-paleGreen p-6">
                    <h2 className="text-xl font-semibold text-agritech-darkGreen">Order Summary</h2>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg text-agritech-darkGreen">Cart Items</h3>
                        <Button
                          variant="link"
                          className="text-agritech-green hover:text-agritech-darkGreen p-0"
                          onClick={() => setExpandedSection(expandedSection === 'cart' ? null : 'cart')}
                          aria-expanded={expandedSection === 'cart'}
                          aria-controls="cart-items"
                        >
                          {expandedSection === 'cart' ? 'Hide Items' : 'Show Items'}
                        </Button>
                      </div>
                      {expandedSection === 'cart' && (
                        <div id="cart-items" className="space-y-4">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md mr-3"
                                onError={(e) => (e.target.src = '/fallback-image.png')}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-agritech-darkGreen">{item.name}</h4>
                                <p className="text-sm text-gray-600">Qty: {item.quantity} units</p>
                                <p className="text-sm font-semibold text-agritech-green">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg text-agritech-darkGreen">Delivery Information</h3>
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
                          <div id="delivery-info" className="space-y-4">
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-agritech-green mt-1 mr-3" />
                              <div>
                                <p className="font-medium text-agritech-darkGreen">{deliveryInfo.full_name}</p>
                                <p className="text-sm text-gray-600">{deliveryInfo.phone_number}</p>
                                <p className="text-sm text-gray-600">
                                  {deliveryInfo.address}, {deliveryInfo.city}, {deliveryInfo.state}, {deliveryInfo.pin_code}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Truck className="h-5 w-5 text-agritech-green mt-1 mr-3" />
                              <div>
                                <p className="font-medium">Delivery Method</p>
                                <p className="text-sm text-gray-600">
                                  {deliveryInfo.delivery_method === 'self_pickup' ? 'Self Pickup' : 'Parcel'} (Estimated: 3-5 business days)
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg text-agritech-darkGreen">Payment Method</h3>
                          <Button
                            variant="link"
                            className="text-agritech-green hover:text-agritech-darkGreen p-0"
                            onClick={() => setExpandedSection(expandedSection === 'payment' ? null : 'payment')}
                            aria-expanded={expandedSection === 'payment'}
                            aria-controls="payment-info"
                          >
                            {expandedSection === 'payment' ? 'Hide Options' : 'Show Options'}
                          </Button>
                        </div>
                        {expandedSection === 'payment' && (
                          <div id="payment-info" className="space-y-2">
                            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                              <SelectTrigger className="w-[200px] border-agritech-green">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="upi">UPI (GPay)</SelectItem>
                                <SelectItem value="pay_on_delivery">Pay on Delivery</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="rounded-xl shadow-lg">
                  <CardHeader className="bg-agritech-paleGreen p-6">
                    <h2 className="text-xl font-semibold text-agritech-darkGreen">Price Details</h2>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Price ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </span>
                        <span>₹{itemsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Charges</span>
                        <span>₹{deliveryFee.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total Amount</span>
                        <span className="text-agritech-green">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="w-full bg-agritech-green hover:bg-agritech-darkGreen transition-transform hover:scale-105"
                          onClick={handlePlaceOrder}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin h-5 w-5 mr-2"
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
                              Placing Order...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <CreditCard className="h-5 w-5 mr-2" />
                              Place Your Order
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                        Confirm and place your order
                      </TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8 bg-agritech-green text-white rounded-lg p-6 shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Continue Shopping!</h2>
              <p className="text-sm mb-4">Explore more agricultural products after placing your order.</p>
              <Button
                className="bg-white text-agritech-green hover:bg-gray-100"
                onClick={() => navigate('/market')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Billing;