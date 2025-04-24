import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input'; // Added import
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  }, []);

  const fetchProduct = async (retries = 3, delay = 1000) => {
    setIsLoading(true);
    setError(null);
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Fetching product with ID (attempt ${i + 1}):`, id);
        const response = await axios.get(`http://localhost:8000/products/${id}`, {
          headers: { 'X-Session-ID': localStorage.getItem('session_id') },
        });
        console.log('Backend response:', response.data);
        console.log('Response includes seller_id:', 'seller_id' in response.data, response.data.seller_id);
        setProduct(response.data);
        return;
      } catch (e) {
        console.error('Fetch error:', {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data,
        });
        let errorMessage = 'Failed to load product';
        if (e.response?.status === 400) {
          errorMessage = 'Invalid product ID format';
        } else if (e.response?.status === 404) {
          errorMessage = 'Product not found';
        } else if (e.response?.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
          navigate('/login');
          return;
        }
        if (i < retries - 1) {
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        setError(errorMessage);
        navigate('/market');
        return;
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log('Product ID from URL:', id);
    console.log('Session ID:', localStorage.getItem('session_id'));
    if (!id) {
      console.log('No ID provided');
      setError('No product ID provided');
      navigate('/market');
      return;
    }
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      console.log('No session ID found');
      setError('Please log in to view product details');
      navigate('/login');
      return;
    }
    fetchProduct();
  }, [id, navigate]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, product?.quantity || 1));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;
    setError(null);
    setSuccess(null);
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cartData.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity + quantity > product.quantity) {
        setError('Cannot add more than available quantity');
        console.log('Error displayed:', 'Cannot add more than available quantity');
        return;
      }
      existing.quantity += quantity;
    } else {
      cartData.push({ ...product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cartData));
    setCart(cartData);
    setSuccess(`${product.name} added to cart`);
    console.log('Cart updated:', cartData);
    console.log('Success displayed:', `${product.name} added to cart`);
  };

  const handleCheckout = () => {
    navigate('/delivery');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p>{error || 'Product not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Product data in render:', product);
  console.log('Seller ID value:', product.seller_id);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="text-white hover:bg-green-800 p-2 rounded-full"
              aria-label="Go back to market"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name || 'Product Details'}</h1>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 max-w-6xl mx-auto" role="alert">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 max-w-6xl mx-auto" role="alert">
            <p>{success}</p>
          </div>
        )}

        {/* Product Details */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-96 md:h-auto overflow-hidden">
                <img
                  src={product.image || 'https://via.placeholder.com/400x400?text=Product+Image'}
                  alt={product.name || 'Product'}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  onError={handleImageError}
                />
              </div>
              <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name || 'Unnamed Product'}</h1>
                  <p className="text-gray-500 mb-2">Category: {product.category || 'N/A'}</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">₹{product.price || 0}/{product.unit || 'unit'}</p>
                  <p className="text-sm text-gray-600 mb-2">Available: {product.quantity || 0} {product.unit || ''}</p>
                  <p className="text-gray-700 font-bold">Description: {product.description ? product.description.slice(0, 200) + (product.description.length > 200 ? '...' : '') : 'No description available'}</p>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4 mb-6">
                  {/* <div className="flex items-center">
                    <User className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700">
                      Seller: {product.seller_id ? product.seller_id.slice(0, 8) : 'Seller information unavailable'}
                    </span>
                  </div> */}
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Location: India</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Self Pickup or Parcel Available</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        id="quantity"
                        min="1"
                        max={product.quantity || 1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                        className="w-20 text-center"
                        aria-label="Quantity"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= (product.quantity || 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-gray-600">{product.unit || ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lg">Total: ₹{(product.price || 0) * quantity}</p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleAddToCart}
                      disabled={product.quantity === 0}
                      aria-label="Add to cart"
                    >
                      Add to Cart
                    </Button>
                    {cart.length > 0 && (
                      <Button
                        variant="outline"
                        className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                        onClick={handleCheckout}
                        aria-label="View cart"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Cart
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Sticky Mini-Cart Summary */}
          {cart.length > 0 && (
            <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full sm:w-80 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Cart Summary</h3>
              <p className="text-gray-600">Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
              <p className="text-gray-600">Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</p>
              <Button
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleCheckout}
                aria-label="Proceed to checkout"
              >
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;