
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Check, MapPin, Truck, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Billing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [paymentMethod] = useState('Google Pay (GPay)');
  
  useEffect(() => {
    // Get selected product from localStorage
    const storedProduct = localStorage.getItem('selectedProduct');
    const storedQuantity = localStorage.getItem('selectedQuantity');
    const storedDeliveryInfo = localStorage.getItem('deliveryDetails');
    
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    } else {
      navigate('/market');
    }
    
    if (storedQuantity) {
      setQuantity(Number(storedQuantity));
    }
    
    if (storedDeliveryInfo) {
      setDeliveryInfo(JSON.parse(storedDeliveryInfo));
    } else {
      navigate(`/delivery/${id}`);
    }
  }, [id, navigate]);

  const handlePlaceOrder = () => {
    // Generate a random order ID
    const orderId = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('orderId', orderId);
    
    // Create order object
    const order = {
      id: orderId,
      product: product,
      quantity: quantity,
      deliveryInfo: deliveryInfo,
      status: 'pending',
      date: new Date().toISOString(),
      totalAmount: product.price * quantity + 40,
      paymentMethod: paymentMethod
    };
    
    // Get existing orders array or create empty one
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    
    // Save updated orders to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Navigate to order confirmation page
    navigate(`/order-confirmation/${orderId}`);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to previous page
  };

  if (!product || !deliveryInfo) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <Button 
          variant="ghost" 
          className="p-2 h-auto"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        
        <div className="max-w-4xl mx-auto mt-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-agritech-green">Order Summary</h1>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-4">Product Details</h2>
              
              <div className="flex items-start">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-agritech-darkGreen">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.description ? product.description.substring(0, 100) + '...' : ''}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      Qty: {quantity} {product.unit}
                    </span>
                    <span className="font-medium text-agritech-green">
                      ₹{product.price}/{product.unit}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-agritech-green mt-1 mr-2" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-gray-600">
                      {deliveryInfo.fullName}, {deliveryInfo.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {deliveryInfo.address}, {deliveryInfo.city} {deliveryInfo.state}, {deliveryInfo.pinCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Truck className="h-4 w-4 text-agritech-green mt-1 mr-2" />
                  <div>
                    <p className="font-medium">Delivery Method</p>
                    <p className="text-sm text-gray-600">
                      Home Delivery (Estimated: 3-5 business days)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CreditCard className="h-4 w-4 text-agritech-green mt-1 mr-2" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <div className="flex items-center">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1024px-Google_Pay_Logo_%282020%29.svg.png" 
                        alt="Google Pay" 
                        className="h-6 mr-2" 
                      />
                      <p className="text-sm text-gray-600">
                        {paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-4">Price Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({quantity} {product.unit})</span>
                  <span>₹{product.price * quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span>₹40</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-agritech-green">₹{product.price * quantity + 40}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full bg-agritech-green hover:bg-agritech-darkGreen"
                  onClick={handlePlaceOrder}
                >
                  Place Your Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
