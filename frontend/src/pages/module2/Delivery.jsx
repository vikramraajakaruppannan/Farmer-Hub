import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
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

const Delivery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    pin_code: '',
    city: '',
    state: '',
    delivery_method: 'parcel',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const deliveryData = JSON.parse(localStorage.getItem('delivery') || '{}');
    setCart(cartData);
    setDeliveryInfo({
      full_name: deliveryData.full_name || '',
      phone_number: deliveryData.phone_number || '',
      address: deliveryData.address || '',
      pin_code: deliveryData.pin_code || '',
      city: deliveryData.city || '',
      state: deliveryData.state || '',
      delivery_method: deliveryData.delivery_method || 'parcel',
    });
    if (!cartData.length) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before proceeding.',
        variant: 'destructive',
      });
      navigate('/market');
    }
  }, [navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo({ ...deliveryInfo, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleDeliveryMethodChange = (value) => {
    setDeliveryInfo({ ...deliveryInfo, delivery_method: value });
    setErrors({ ...errors, delivery_method: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!deliveryInfo.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (deliveryInfo.full_name.length > 100) {
      newErrors.full_name = 'Full name must be under 100 characters';
    }
    if (!deliveryInfo.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(deliveryInfo.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10 digits';
    }
    if (!deliveryInfo.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (deliveryInfo.address.length > 200) {
      newErrors.address = 'Address must be under 200 characters';
    }
    if (!deliveryInfo.pin_code) {
      newErrors.pin_code = 'Pin code is required';
    } else if (!/^\d{6}$/.test(deliveryInfo.pin_code)) {
      newErrors.pin_code = 'Pin code must be 6 digits';
    }
    if (!deliveryInfo.city.trim()) {
      newErrors.city = 'City is required';
    } else if (deliveryInfo.city.length > 50) {
      newErrors.city = 'City must be under 50 characters';
    }
    if (!deliveryInfo.state.trim()) {
      newErrors.state = 'State is required';
    } else if (deliveryInfo.state.length > 50) {
      newErrors.state = 'State must be under 50 characters';
    }
    if (!deliveryInfo.delivery_method) {
      newErrors.delivery_method = 'Delivery method is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast({
      title: 'Cart Updated',
      description: 'Cart quantities have been updated.',
    });
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast({
      title: 'Item Removed',
      description: 'Item has been removed from your cart.',
    });
    if (updatedCart.length === 0) {
      navigate('/market');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Invalid Input',
        description: 'Please fix the errors in the delivery form.',
        variant: 'destructive',
      });
      return;
    }
    localStorage.setItem('delivery', JSON.stringify(deliveryInfo));
    toast({
      title: 'Success',
      description: 'Delivery info saved',
    });
    navigate('/billing');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
              aria-label="Back to Market"
            >
              <ArrowLeft className="h-5 w-5 text-agritech-darkGreen" />
            </Button>
            <h1 className="text-3xl font-bold text-agritech-darkGreen">Delivery Details</h1>
          </div>

          <div className="max-w-5xl mx-auto">
            <CheckoutProgress currentStep="Delivery" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <Card className="rounded-xl shadow-lg">
                  <CardHeader className="bg-agritech-paleGreen p-6">
                    <h2 className="text-xl font-semibold text-agritech-darkGreen">Order Summary</h2>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => (e.target.src = '/fallback-image.png')}
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-agritech-darkGreen">{item.name}</h3>
                          <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}/unit</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                Decrease quantity
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                Increase quantity
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveItem(item.id)}
                                  aria-label={`Remove ${item.name} from cart`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                Remove item from cart
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-agritech-green">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4 mt-4 bg-gray-50 rounded-b-md px-4 -mx-4">
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>₹{itemsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-gray-600">Delivery:</span>
                        <span>₹{deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-agritech-darkGreen">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ShoppingBag className="h-4 w-4 mr-2 text-agritech-green" />
                      <span>
                        {deliveryInfo.delivery_method === 'self_pickup' ? 'Self Pickup' : 'Home Delivery'} Available
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <Card className="rounded-xl shadow-lg">
                  <CardHeader className="bg-agritech-paleGreen p-6">
                    <h2 className="text-xl font-semibold text-agritech-darkGreen">Delivery Information</h2>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_method" className="text-agritech-darkGreen">
                          Delivery Method*
                        </Label>
                        <Select value={deliveryInfo.delivery_method} onValueChange={handleDeliveryMethodChange}>
                          <SelectTrigger
                            id="delivery_method"
                            className={`border-agritech-green ${errors.delivery_method ? 'border-red-500' : ''}`}
                          >
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parcel">Parcel (₹40)</SelectItem>
                            <SelectItem value="self_pickup">Self Pickup (Free)</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.delivery_method && (
                          <p
                            id="delivery_method-error"
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            {errors.delivery_method}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-agritech-darkGreen">
                            Full Name*
                          </Label>
                          <Input
                            id="full_name"
                            name="full_name"
                            value={deliveryInfo.full_name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={`h-10 ${errors.full_name ? 'border-red-500' : ''}`}
                            required
                            aria-describedby={errors.full_name ? 'full_name-error' : undefined}
                          />
                          {errors.full_name && (
                            <p id="full_name-error" className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.full_name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number" className="text-agritech-darkGreen">
                            Phone Number*
                          </Label>
                          <Input
                            id="phone_number"
                            name="phone_number"
                            value={deliveryInfo.phone_number}
                            onChange={handleInputChange}
                            placeholder="Enter 10-digit number"
                            className={`h-10 ${errors.phone_number ? 'border-red-500' : ''}`}
                            required
                            aria-describedby={errors.phone_number ? 'phone_number-error' : undefined}
                          />
                          {errors.phone_number && (
                            <p
                              id="phone_number-error"
                              className="text-red-500 text-sm flex items-center gap-1"
                            >
                              <AlertCircle className="h-4 w-4" />
                              {errors.phone_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-agritech-darkGreen">
                          Complete Address*
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={deliveryInfo.address}
                          onChange={handleInputChange}
                          placeholder="House no., Building, Street, Area"
                          rows={3}
                          className={errors.address ? 'border-red-500' : ''}
                          required
                          aria-describedby={errors.address ? 'address-error' : undefined}
                        />
                        {errors.address && (
                          <p id="address-error" className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.address}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="pin_code" className="text-agritech-darkGreen">
                            PIN Code*
                          </Label>
                          <Input
                            id="pin_code"
                            name="pin_code"
                            value={deliveryInfo.pin_code}
                            onChange={handleInputChange}
                            placeholder="6-digit PIN code"
                            className={`h-10 ${errors.pin_code ? 'border-red-500' : ''}`}
                            required
                            aria-describedby={errors.pin_code ? 'pin_code-error' : undefined}
                          />
                          {errors.pin_code && (
                            <p id="pin_code-error" className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle sexuality="h-4 w-4" />
                              {errors.pin_code}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-agritech-darkGreen">
                            City*
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={deliveryInfo.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className={`h-10 ${errors.city ? 'border-red-500' : ''}`}
                            required
                            aria-describedby={errors.city ? 'city-error' : undefined}
                          />
                          {errors.city && (
                            <p id="city-error" className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.city}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-agritech-darkGreen">
                            State*
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            value={deliveryInfo.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            className={`h-10 ${errors.state ? 'border-red-500' : ''}`}
                            required
                            aria-describedby={errors.state ? 'state-error' : undefined}
                          />
                          {errors.state && (
                            <p id="state-error" className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.state}
                            </p>
                          )}
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            className="w-full bg-agritech-green hover:bg-agritech-darkGreen transition-transform hover:scale-105"
                            aria-label="Proceed to Billing"
                          >
                            <MapPin className="h-5 w-5 mr-2" />
                            Proceed to Billing
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                          Save delivery details and proceed to payment
                        </TooltipContent>
                      </Tooltip>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8 bg-agritech-green text-white rounded-lg p-6 shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Explore More Products!</h2>
              <p className="text-sm mb-4">Add more items to your cart before checking out.</p>
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

export default Delivery;