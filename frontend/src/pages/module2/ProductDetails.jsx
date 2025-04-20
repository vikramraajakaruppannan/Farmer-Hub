import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, User, MapPin, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  }, []);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}`, {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      if (!response.data.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(response.data.id)) {
        throw new Error('Invalid product ID');
      }
      setProduct(response.data);
    } catch (e) {
      console.error('Fetch product error:', e);
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
      if (e.response?.status === 401) navigate('/login');
      if (e.response?.status === 404) navigate('/market');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      toast({
        title: 'Error',
        description: 'Invalid product ID',
        variant: 'destructive',
      });
      navigate('/market');
      return;
    }
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.quantity || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cartData.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity + quantity > product.quantity) {
        toast({
          title: 'Error',
          description: 'Cannot add more than available quantity',
          variant: 'destructive',
        });
        return;
      }
      existing.quantity += quantity;
    } else {
      cartData.push({ ...product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cartData));
    setCart(cartData);
    toast({
      title: 'Success',
      description: `${product.name} added to cart`,
    });
  };

  const handleCheckout = () => {
    navigate('/delivery'); // Always go to delivery first
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleImageError = (e) => {
    e.target.src = '/fallback-image.png';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p>Product not found.</p>
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
        <div className="max-w-6xl mx-auto mt-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="h-96 md:h-auto">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-agritech-darkGreen mb-2">{product.name}</h1>
                  <p className="text-gray-500 mb-4">Category: {product.category}</p>
                  <p className="text-2xl font-bold text-agritech-green mb-2">₹{product.price}/{product.unit}</p>
                  <p className="text-sm text-gray-600">Available Quantity: {product.quantity} {product.unit}</p>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-agritech-green mr-2" />
                    <span className="text-gray-700">Seller ID: {product.seller_id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-agritech-green mr-2" />
                    <span className="text-gray-700">Location: India</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-agritech-green mr-2" />
                    <span className="text-gray-700">Self Pickup or Parcel Available</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-24 border border-gray-300 rounded-md px-3 py-2"
                      />
                      <span className="ml-2">{product.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Total: ₹{product.price * quantity}</p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-agritech-green hover:bg-agritech-darkGreen"
                      onClick={handleAddToCart}
                      disabled={product.quantity === 0}
                    >
                      Add to Cart
                    </Button>
                    {cart.length > 0 && (
                      <Button
                        variant="outline"
                        className="flex-1 border-agritech-green text-agritech-green hover:bg-agritech-paleGreen"
                        onClick={handleCheckout}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;