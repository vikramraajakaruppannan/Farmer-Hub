import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Plus, Edit, Trash, Package, Eye, ArrowLeft, MapPin, Truck, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Progress Tracker Component for Order Status
const ProgressTracker = ({ status, deliveryMethod }) => {
  const statuses = deliveryMethod === 'self_pickup'
    ? ['Pending', 'Ready for Pickup', 'Delivered']
    : ['Pending', 'Packed', 'Shipped', 'Delivered'];
  const currentIndex = statuses.indexOf(status);

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
            <p className="mt-2 text-xs capitalize text-gray-600">{step.replace('_', ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ManageProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewOrders, setShowViewOrders] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productOrders, setProductOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const limit = 9;

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Seeds',
    quantity: '',
    unit: 'kg',
    price: '',
    description: '',
    image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  // State for order management
  const [orderDetails, setOrderDetails] = useState({});
  const [orderStatus, setOrderStatus] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Valid status transitions (matching backend)
  const validTransitions = {
    self_pickup: {
      Pending: ['Ready for Pickup'],
      'Ready for Pickup': ['Delivered'],
      Delivered: [],
      Cancelled: [],
    },
    parcel: {
      Pending: ['Packed'],
      Packed: ['Shipped'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/products', {
          headers: { 'X-Session-ID': localStorage.getItem('session_id') },
          params: {
            seller_id: localStorage.getItem('user_id'),
            q: searchQuery || undefined,
            category: filterCategory !== 'all' ? filterCategory : undefined,
            limit,
            offset: page * limit,
          },
        });
        setProducts(response.data);
        setHasMore(response.data.length === limit);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [navigate, toast, page, searchQuery, filterCategory]);

  const validateForm = () => {
    const newErrors = {};
    if (!newProduct.name.trim()) newErrors.name = 'Product name is required';
    else if (newProduct.name.length > 100) newErrors.name = 'Name must be under 100 characters';
    if (!newProduct.quantity || parseFloat(newProduct.quantity) <= 0) newErrors.quantity = 'Quantity must be positive';
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) newErrors.price = 'Price must be positive';
    if (newProduct.description.length > 500) newErrors.description = 'Description must be under 500 characters';
    if (!['Seeds', 'Fertilizers', 'Pesticides', 'Tools'].includes(newProduct.category)) {
      newErrors.category = 'Invalid category';
    }
    if (!['kg', 'g', 'L', 'pcs'].includes(newProduct.unit)) {
      newErrors.unit = 'Invalid unit';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) {
      toast({
        title: 'Invalid Input',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = newProduct.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await axios.post(
          'http://localhost:8000/products/upload-image',
          formData,
          {
            headers: {
              'X-Session-ID': localStorage.getItem('session_id'),
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        imageUrl = uploadResponse.data.image_url;
      }
      const productData = {
        ...newProduct,
        image: imageUrl,
        quantity: parseFloat(newProduct.quantity),
        price: parseFloat(newProduct.price),
      };
      await axios.post('http://localhost:8000/products', productData, {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        category: 'Seeds',
        quantity: '',
        unit: 'kg',
        price: '',
        description: '',
        image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
      });
      setImageFile(null);
      setErrors({});
      setPage(0);
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add product';
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

  const handleEditProduct = async () => {
    if (!validateForm()) {
      toast({
        title: 'Invalid Input',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = newProduct.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await axios.post(
          'http://localhost:8000/products/upload-image',
          formData,
          {
            headers: {
              'X-Session-ID': localStorage.getItem('session_id'),
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        imageUrl = uploadResponse.data.image_url;
      }
      const productData = {
        ...newProduct,
        image: imageUrl,
        quantity: parseFloat(newProduct.quantity),
        price: parseFloat(newProduct.price),
      };
      await axios.put(`http://localhost:8000/products/${editProductId}`, productData, {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      setShowEditProduct(false);
      setNewProduct({
        name: '',
        category: 'Seeds',
        quantity: '',
        unit: 'kg',
        price: '',
        description: '',
        image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
      });
      setImageFile(null);
      setEditProductId(null);
      setErrors({});
      setPage(0);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update product';
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

  const handleDeleteProduct = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:8000/products/${deleteProductId}`, {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
      setPage(0);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete product';
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

  const handleViewOrders = async (product) => {
    setSelectedProduct(product);
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/seller/orders', {
        headers: { 'X-Session-ID': localStorage.getItem('session_id') },
      });
      const filteredOrders = response.data.filter(order =>
        order.products.some(p => p.id === product.id)
      );
      setProductOrders(filteredOrders);
      const details = {};
      const statuses = {};
      filteredOrders.forEach(order => {
        details[order.id] = {
          pickup_time: order.pickup_time ? new Date(order.pickup_time).toISOString().slice(0, 16) : '',
          tracking_link: order.tracking_link || '',
        };
        statuses[order.id] = order.status;
      });
      setOrderDetails(details);
      setOrderStatus(statuses);
      setShowViewOrders(true);
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

  const handleUpdateOrderStatus = async (orderId, order) => {
    setIsLoading(true);
    try {
      const newStatus = orderStatus[orderId];
      const currentStatus = order.status;
      const deliveryMethod = order.delivery_method;

      // Validate status transition
      if (!validTransitions[deliveryMethod][currentStatus]?.includes(newStatus)) {
        toast({
          title: 'Invalid Status Transition',
          description: `Cannot change status from ${currentStatus} to ${newStatus}`,
          variant: 'destructive',
        });
        return;
      }

      // For self_pickup, ensure pickup_time is set for Ready for Pickup
      if (deliveryMethod === 'self_pickup' && newStatus === 'Ready for Pickup') {
        const pickupTime = orderDetails[orderId]?.pickup_time;
        if (!pickupTime) {
          toast({
            title: 'Missing Pickup Time',
            description: 'Please set an approximate pickup time before marking as Ready for Pickup.',
            variant: 'destructive',
          });
          return;
        }
        // Update pickup_time
        await axios.put(
          `http://localhost:8000/orders/${orderId}/details`,
          { pickup_time: pickupTime },
          {
            headers: { 'X-Session-ID': localStorage.getItem('session_id') },
          }
        );
      }

      // For parcel, include tracking_link for Shipped
      if (deliveryMethod === 'parcel' && newStatus === 'Shipped') {
        const trackingLink = orderDetails[orderId]?.tracking_link;
        if (trackingLink) {
          await axios.put(
            `http://localhost:8000/orders/${orderId}/details`,
            { tracking_link: trackingLink },
            {
              headers: { 'X-Session-ID': localStorage.getItem('session_id') },
            }
          );
        }
      }

      // Update status
      await axios.put(
        `http://localhost:8000/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { 'X-Session-ID': localStorage.getItem('session_id') },
        }
      );

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      await handleViewOrders(selectedProduct);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update order status';
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
              <h1 className="text-3xl font-bold text-agritech-darkGreen">Manage Your Products</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Seeds">Seeds</SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Pesticides">Pesticides</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="bg-agritech-green hover:bg-agritech-darkGreen"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto">
            {isLoading && products.length === 0 ? (
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
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Products Found</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't added any products yet. Start by adding your first product to your store!
                </p>
                <Button
                  className="bg-agritech-green hover:bg-agritech-darkGreen"
                  onClick={() => setShowAddProduct(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Product
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <CardHeader className="p-0">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => (e.target.src = '/fallback-image.png')}
                          />
                          {product.quantity < 10 && (
                            <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg text-agritech-darkGreen mb-2 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">Category: {product.category}</p>
                        <p className="text-sm text-gray-600 mb-1">Price: ₹{product.price}/{product.unit}</p>
                        <p className="text-sm text-gray-600 mb-3">Stock: {product.quantity} {product.unit}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-agritech-green border-agritech-green hover:bg-agritech-green hover:text-white"
                                onClick={() => {
                                  setNewProduct(product);
                                  setEditProductId(product.id);
                                  setShowEditProduct(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                              Edit product details
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-500 hover:bg-red-50"
                                onClick={() => {
                                  setDeleteProductId(product.id);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                              Delete this product
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-agritech-green border-agritech-green hover:bg-agritech-green hover:text-white"
                                onClick={() => handleViewOrders(product)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> View Orders
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                              View orders for this product
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="bg-agritech-green hover:bg-agritech-darkGreen"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!hasMore}
                    className="bg-agritech-green hover:bg-agritech-darkGreen"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Add Product Dialog */}
          <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
            <DialogContent className="sm:max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-agritech-darkGreen">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name*</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className={`h-10 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seeds">Seeds</SelectItem>
                      <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                      <SelectItem value="Pesticides">Pesticides</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity*</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      className={`h-10 ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="Enter quantity"
                    />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit*</Label>
                    <Select
                      value={newProduct.unit}
                      onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                    >
                      <SelectTrigger id="unit" className={errors.unit ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)*</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className={`h-10 ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="Enter price"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className={errors.description ? 'border-red-500' : ''}
                    placeholder="Describe your product"
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <div>
                  <Label htmlFor="image">Product Image (jpg, jpeg, png)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const ext = file.name.split('.').pop().toLowerCase();
                        if (!['jpg', 'jpeg', 'png'].includes(ext)) {
                          toast({
                            title: 'Invalid File',
                            description: 'Only jpg, jpeg, or png files are allowed.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setImageFile(file);
                      }
                    }}
                    className="h-10"
                  />
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                  {isLoading && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddProduct(false);
                    setNewProduct({
                      name: '',
                      category: 'Seeds',
                      quantity: '',
                      unit: 'kg',
                      price: '',
                      description: '',
                      image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
                    });
                    setImageFile(null);
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-agritech-green hover:bg-agritech-darkGreen"
                  onClick={handleAddProduct}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                  ) : null}
                  {isLoading ? 'Adding...' : 'Add Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
            <DialogContent className="sm:max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-agritech-darkGreen">Edit Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name*</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className={`h-10 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seeds">Seeds</SelectItem>
                      <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                      <SelectItem value="Pesticides">Pesticides</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity*</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      className={`h-10 ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="Enter quantity"
                    />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit*</Label>
                    <Select
                      value={newProduct.unit}
                      onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                    >
                      <SelectTrigger id="unit" className={errors.unit ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)*</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className={`h-10 ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="Enter price"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className={errors.description ? 'border-red-500' : ''}
                    placeholder="Describe your product"
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <div>
                  <Label htmlFor="image">Product Image (jpg, jpeg, png)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const ext = file.name.split('.').pop().toLowerCase();
                        if (!['jpg', 'jpeg', 'png'].includes(ext)) {
                          toast({
                            title: 'Invalid File',
                            description: 'Only jpg, jpeg, or png files are allowed.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setImageFile(file);
                      }
                    }}
                    className="h-10"
                  />
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                  {isLoading && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditProduct(false);
                    setNewProduct({
                      name: '',
                      category: 'Seeds',
                      quantity: '',
                      unit: 'kg',
                      price: '',
                      description: '',
                      image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
                    });
                    setImageFile(null);
                    setEditProductId(null);
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-agritech-green hover:bg-agritech-darkGreen"
                  onClick={handleEditProduct}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                  ) : null}
                  {isLoading ? 'Updating...' : 'Update Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl text-agritech-darkGreen">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product from your store.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteProduct}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* View Orders Dialog */}
          <Dialog open={showViewOrders} onOpenChange={setShowViewOrders}>
            <DialogContent className="max-w-5xl rounded-xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-agritech-darkGreen">
                  Orders for {selectedProduct?.name}
                </DialogTitle>
              </DialogHeader>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
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
              ) : productOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders found for this product.</p>
                </div>
              ) : (
                <div className="space-y-4">
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
                        {productOrders.map((order) => (
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
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status.toLowerCase() === 'delivered'
                                      ? 'bg-green-100 text-green-700'
                                      : order.status.toLowerCase() === 'shipped' ||
                                        order.status.toLowerCase() === 'ready for pickup'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {order.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {order.delivery_method === 'self_pickup' ? 'Self Pickup' : 'Parcel'}
                              </td>
                              <td className="px-6 py-4">
                                ₹{order.total_price ? order.total_price.toFixed(2) : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
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
                              </td>
                            </tr>
                            {expandedOrder === order.id && (
                              <tr>
                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                  <div className="space-y-6">
                                    {/* Progress Tracker */}
                                    <ProgressTracker
                                      status={order.status}
                                      deliveryMethod={order.delivery_method}
                                    />

                                    {/* Buyer Information */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-agritech-darkGreen mb-2">
                                        Buyer Information
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Name: {order.delivery.full_name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Address: {order.delivery.address}, {order.delivery.city},{' '}
                                        {order.delivery.state} {order.delivery.pin_code}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Phone: {order.delivery.phone_number}
                                      </p>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-agritech-darkGreen mb-2">
                                        Items
                                      </h4>
                                      <ul className="space-y-2">
                                        {order.products.map((item) => (
                                          <li
                                            key={item.id}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                          >
                                            <Package className="h-4 w-4 text-agritech-green" />
                                            <span>
                                              {item.name} - Qty: {item.quantity} - ₹
                                              {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Order Management */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label
                                          htmlFor={`status-${order.id}`}
                                          className="text-sm font-medium"
                                        >
                                          Update Status
                                        </Label>
                                        <Select
                                          value={orderStatus[order.id] || order.status}
                                          onValueChange={(value) =>
                                            setOrderStatus({ ...orderStatus, [order.id]: value })
                                          }
                                        >
                                          <SelectTrigger
                                            id={`status-${order.id}`}
                                            className="h-10 mt-1"
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {order.delivery_method === 'self_pickup' ? (
                                              <>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Ready for Pickup">
                                                  Ready for Pickup
                                                </SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                              </>
                                            ) : (
                                              <>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Packed">Packed</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                              </>
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              className="mt-2 bg-agritech-green hover:bg-agritech-darkGreen"
                                              onClick={() => handleUpdateOrderStatus(order.id, order)}
                                              disabled={isLoading}
                                            >
                                              Update Status
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-gray-800 text-white p-2 rounded text-xs">
                                            Save status change
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                      <div>
                                        {order.delivery_method === 'self_pickup' ? (
                                          <div>
                                            <Label
                                              htmlFor={`pickup-time-${order.id}`}
                                              className="text-sm font-medium"
                                            >
                                              Approximate Pickup Time
                                            </Label>
                                            <Input
                                              id={`pickup-time-${order.id}`}
                                              type="datetime-local"
                                              value={orderDetails[order.id]?.pickup_time || ''}
                                              onChange={(e) =>
                                                setOrderDetails({
                                                  ...orderDetails,
                                                  [order.id]: {
                                                    ...orderDetails[order.id],
                                                    pickup_time: e.target.value,
                                                  },
                                                })
                                              }
                                              className="h-10 mt-1"
                                            />
                                          </div>
                                        ) : (
                                          <div>
                                            <Label
                                              htmlFor={`tracking-link-${order.id}`}
                                              className="text-sm font-medium"
                                            >
                                              Tracking Link
                                            </Label>
                                            <Input
                                              id={`tracking-link-${order.id}`}
                                              value={orderDetails[order.id]?.tracking_link || ''}
                                              onChange={(e) =>
                                                setOrderDetails({
                                                  ...orderDetails,
                                                  [order.id]: {
                                                    ...orderDetails[order.id],
                                                    tracking_link: e.target.value,
                                                  },
                                                })
                                              }
                                              placeholder="https://tracking.example.com"
                                              className="h-10 mt-1"
                                            />
                                          </div>
                                        )}
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
                </div>
              )}
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowViewOrders(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ManageProducts;
