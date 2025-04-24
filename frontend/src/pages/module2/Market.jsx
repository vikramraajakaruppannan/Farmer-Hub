import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Search, MapPin, User, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';

const Market = () => {
  const [activeTab, setActiveTab] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const limit = 9;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/products', {
        params: {
          q: debouncedSearchQuery || undefined,
          category: activeTab === 'All Items' ? undefined : activeTab,
          limit,
          offset: page * limit,
        },
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      const validProducts = response.data.filter(p => p.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id));
      setProducts(validProducts);
      setHasMore(response.data.length === limit);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
      if (e.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, debouncedSearchQuery, page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const handleItemClick = (itemId) => {
    console.log('Navigating to product with ID:', itemId);
    if (!itemId) {
      toast({
        title: 'Error',
        description: 'Invalid product ID',
        variant: 'destructive',
      });
      return;
    }
    navigate(`/product/${itemId}`);
  };  

  const handleAddToCart = (product) => {
    if (!product.id) {
      toast({
        title: 'Error',
        description: 'Invalid product ID',
        variant: 'destructive',
      });
      return;
    }
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cartData.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.quantity) {
        toast({
          title: 'Error',
          description: 'Cannot add more than available quantity',
          variant: 'destructive',
        });
        return;
      }
      existing.quantity += 1;
    } else {
      cartData.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cartData));
    setCart(cartData);
    toast({
      title: 'Success',
      description: `${product.name} added to cart`,
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    const deliveryData = JSON.parse(localStorage.getItem('delivery') || '{}');
    if (!Object.keys(deliveryData).length) {
      navigate('/delivery');
    } else {
      navigate('/billing');
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/fallback-image.png';
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
              <h1 className="text-3xl font-bold text-agritech-darkGreen">Green Products Marketplace</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="text-agritech-green border-agritech-green hover:bg-agritech-paleGreen"
                onClick={() => navigate('/track-orders')}
              >
                Track Orders
              </Button>
              <Button
                className="bg-agritech-green text-white hover:bg-agritech-darkGreen"
                onClick={() => navigate('/manage-products')}
              >
                Sell a Product
              </Button>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="bg-agritech-green text-white rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Discover Sustainable Products</h2>
            <p className="text-sm mb-4">Shop eco-friendly agricultural products from trusted farmers.</p>
            <Button
              variant="outline"
              className="bg-white text-agritech-green hover:bg-gray-100"
              onClick={() => setSearchQuery('organic')}
            >
              Explore Organic
            </Button>
          </div>

          {/* Search and Tabs */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by item name..."
                className="pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-agritech-green"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['All Items', 'Seeds', 'Fertilizers', 'Pesticides','Tools'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-agritech-green text-white'
                      : 'text-agritech-green border-agritech-green hover:bg-agritech-paleGreen'
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-agritech-paleGreen p-4 rounded-lg mb-6 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-agritech-green mr-2" />
                  <span className="font-medium">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-agritech-green text-white hover:bg-agritech-darkGreen"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                    Go to checkout page
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          )}

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto">
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
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Products Found</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  No items match your search criteria. Try a different search or category.
                </p>
                <Button
                  className="bg-agritech-green text-white hover:bg-agritech-darkGreen"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                {products.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="p-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => handleItemClick(item.id)}
                          onError={handleImageError}
                        />
                        {item.quantity < 10 && (
                          <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                            Low Stock
                          </span>
                        )}
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3
                          className="text-lg font-semibold text-agritech-darkGreen cursor-pointer hover:underline"
                          onClick={() => handleItemClick(item.id)}
                        >
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">Category: {item.category}</p>
                        <p className="text-sm text-gray-600 mb-2">Available: {item.quantity} {item.unit}</p>
                        <p className="text-lg font-semibold text-agritech-green mb-3">₹{item.price}/{item.unit}</p>
                        <div className="flex items-center mb-2 text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1 text-agritech-green" />
                          <span>Seller ID: {item.seller_id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center mb-4 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1 text-agritech-green" />
                          <span>India</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="w-full bg-agritech-green text-white hover:bg-agritech-darkGreen"
                              onClick={() => handleAddToCart(item)}
                              disabled={item.quantity === 0}
                            >
                              Add to Cart
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                              Add {item.name} to your cart
                          </TooltipContent>
                        </Tooltip>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {products.length > 0 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0 || isLoading}
                  className="bg-agritech-green hover:bg-agritech-darkGreen"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
                  className="bg-agritech-green hover:bg-agritech-darkGreen"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Market;