
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Delivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    pinCode: '',
    state: '',
    city: ''
  });

  useEffect(() => {
    // Get selected product from localStorage
    const storedProduct = localStorage.getItem('selectedProduct');
    const storedQuantity = localStorage.getItem('selectedQuantity');
    
    if (storedProduct) {
      setProduct(JSON.parse(storedProduct));
    }
    
    if (storedQuantity) {
      setQuantity(Number(storedQuantity));
    }
    
    // Get user info from localStorage if available
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setDeliveryInfo(prevState => ({
        ...prevState,
        fullName: userData.name || ''
      }));
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo({
      ...deliveryInfo,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!deliveryInfo.fullName || !deliveryInfo.phoneNumber || !deliveryInfo.address || !deliveryInfo.pinCode) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate phone number
    if (!/^\d{10}$/.test(deliveryInfo.phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // Save delivery information to localStorage
    localStorage.setItem('deliveryDetails', JSON.stringify(deliveryInfo));
    
    // Navigate to billing page
    navigate(`/billing/${id}`);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to previous page
  };

  if (!product) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p>Loading product details...</p>
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
          className="p-2 h-auto mb-4"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-agritech-green">Delivery Details</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Summary */}
            <div>
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-4">Order Summary</h2>
                  
                  <div className="flex items-start mb-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-20 h-20 object-cover rounded-md mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-agritech-darkGreen">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {quantity} {product.unit}
                      </p>
                      <p className="text-sm font-medium text-agritech-green mt-1">
                        ₹{product.price * quantity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{product.price * quantity}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery:</span>
                      <span>₹40</span>
                    </div>
                    <div className="flex justify-between font-semibold text-agritech-darkGreen">
                      <span>Total:</span>
                      <span>₹{product.price * quantity + 40}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <ShoppingBag className="h-4 w-4 mr-2 text-agritech-green" />
                    <span>Home Delivery Available</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Delivery Form */}
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-4">Delivery Address</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name*</Label>
                        <Input 
                          id="fullName" 
                          name="fullName"
                          value={deliveryInfo.fullName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number*</Label>
                        <Input 
                          id="phoneNumber" 
                          name="phoneNumber"
                          value={deliveryInfo.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Enter 10-digit number"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Complete Address*</Label>
                      <Textarea 
                        id="address" 
                        name="address"
                        value={deliveryInfo.address}
                        onChange={handleInputChange}
                        placeholder="House no., Building, Street, Area"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pinCode">PIN Code*</Label>
                        <Input 
                          id="pinCode" 
                          name="pinCode"
                          value={deliveryInfo.pinCode}
                          onChange={handleInputChange}
                          placeholder="6-digit PIN code"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          name="city"
                          value={deliveryInfo.city}
                          onChange={handleInputChange}
                          placeholder="City"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          name="state"
                          value={deliveryInfo.state}
                          onChange={handleInputChange}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-agritech-green hover:bg-agritech-darkGreen"
                      >
                        Deliver to This Address
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
