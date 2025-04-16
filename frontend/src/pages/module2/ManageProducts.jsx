import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Plus, Edit, Trash, Package, Tag, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ManageProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showViewOrders, setShowViewOrders] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productOrders, setProductOrders] = useState([]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Seeds',
    quantity: '',
    unit: 'kg',
    price: '',
    description: '',
    image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
  });
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const userProducts = allProducts.filter(product => product.owner === user.name);
    setProducts(userProducts);
  }, []);

  const handleAddProduct = () => {
    setShowAddProduct(true);
  };

  const handleEditProduct = (product) => {
    setEditProductId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      description: product.description,
      image: product.image,
    });
    setShowEditProduct(true);
  };

  const handleDeleteProduct = (id) => {
    const allProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const updatedProducts = allProducts.filter(product => product.id !== id);
    localStorage.setItem('sellerProducts', JSON.stringify(updatedProducts));
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "Product Deleted",
      description: "Your product has been removed from the marketplace.",
    });
  };

  const handleSubmitProduct = () => {
    if (!newProduct.name || !newProduct.quantity || !newProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const productToAdd = {
      id: Date.now(),
      ...newProduct,
      owner: user.name || 'Anonymous Seller',
      location: user.location || 'Location not specified',
    };

    const allProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    allProducts.push(productToAdd);
    localStorage.setItem('sellerProducts', JSON.stringify(allProducts));
    setProducts([...products, productToAdd]);
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

    toast({
      title: "Product Added",
      description: "Your product has been added to the marketplace.",
    });
  };

  const handleUpdateProduct = () => {
    if (!newProduct.name || !newProduct.quantity || !newProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const allProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const updatedProducts = allProducts.map(product => {
      if (product.id === editProductId) {
        return {
          ...product,
          ...newProduct,
        };
      }
      return product;
    });
    localStorage.setItem('sellerProducts', JSON.stringify(updatedProducts));
    setProducts(products.map(product => {
      if (product.id === editProductId) {
        return {
          ...product,
          ...newProduct,
        };
      }
      return product;
    }));
    setShowEditProduct(false);
    setEditProductId(null);
    setNewProduct({
      name: '',
      category: 'Seeds',
      quantity: '',
      unit: 'kg',
      price: '',
      description: '',
      image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
    });

    toast({
      title: "Product Updated",
      description: "Your product has been updated successfully.",
    });
  };

  const handleViewOrders = (product) => {
    setSelectedProduct(product);
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const productOrders = allOrders.filter(order => 
      order.product.id === product.id
    );
    setProductOrders(productOrders);
    setShowViewOrders(true);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderToUpdate = allOrders.find(order => order.id === orderId);
    const oldStatus = orderToUpdate?.status;
    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus
        };
      }
      return order;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setProductOrders(productOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus
        };
      }
      return order;
    }));
    toast({
      title: "Status Updated",
      description: `Order #${orderId} status changed from ${oldStatus} to ${newStatus}.`,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
        
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-agritech-green">Manage Products</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-agritech-green border-agritech-green"
                onClick={() => navigate('/market')}
              >
                View Marketplace
              </Button>
              <Button 
                className="bg-agritech-green text-white"
                onClick={handleAddProduct}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-agritech-darkGreen">
                        {product.name}
                      </h3>
                      <div className="flex space-x-2">
                        <button 
                          className="text-gray-500 hover:text-agritech-green"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Category: {product.category}</p>
                    <p className="text-sm text-gray-500 mb-2">Available: {product.quantity} {product.unit}</p>
                    <p className="text-lg font-semibold text-agritech-green mb-4">₹{product.price}/{product.unit}</p>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-agritech-green border-agritech-green"
                      onClick={() => handleViewOrders(product)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Orders
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">No Products Listed</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You haven't listed any products yet. Add your first eco-friendly product to start selling.
              </p>
              <Button 
                className="bg-agritech-green text-white"
                onClick={handleAddProduct}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Your First Product
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name*</Label>
              <Input 
                id="name" 
                value={newProduct.name} 
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({...newProduct, category: value})}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seeds">Seeds</SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Pesticides">Pesticides</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity*</Label>
                <Input 
                  id="quantity" 
                  type="number"
                  value={newProduct.quantity} 
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  placeholder="Available quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit*</Label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per unit (₹)*</Label>
              <Input 
                id="price" 
                type="number"
                value={newProduct.price} 
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="Price per unit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newProduct.description} 
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Describe your product"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input 
                id="image" 
                value={newProduct.image} 
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                placeholder="Product image URL"
              />
              <p className="text-xs text-gray-500">Default product image will be used if left empty</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
            <Button className="bg-agritech-green" onClick={handleSubmitProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name*</Label>
              <Input 
                id="edit-name" 
                value={newProduct.name} 
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category*</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({...newProduct, category: value})}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seeds">Seeds</SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Pesticides">Pesticides</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity*</Label>
                <Input 
                  id="edit-quantity" 
                  type="number"
                  value={newProduct.quantity} 
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit*</Label>
                <Select
                  value={newProduct.unit}
                  onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price per unit (₹)*</Label>
              <Input 
                id="edit-price" 
                type="number"
                value={newProduct.price} 
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={newProduct.description} 
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input 
                id="edit-image" 
                value={newProduct.image} 
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProduct(false)}>Cancel</Button>
            <Button className="bg-agritech-green" onClick={handleUpdateProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewOrders} onOpenChange={setShowViewOrders}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Orders for {selectedProduct ? selectedProduct.name : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {productOrders.length > 0 ? (
              <div className="space-y-4">
                {productOrders.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">Order #{order.id}</span>
                        <span className="text-xs text-gray-500">Placed on {formatDate(order.date)}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Customer Details</p>
                          <p className="text-sm text-gray-600">
                            {order.deliveryInfo.fullName}, {order.deliveryInfo.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {order.deliveryInfo.address}, {order.deliveryInfo.city} {order.deliveryInfo.state}, {order.deliveryInfo.pinCode}
                          </p>
                          <p className="text-sm font-medium mb-1">Order Details</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {order.quantity} {order.product.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ₹{order.totalAmount}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Update Status</p>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="packed">Packed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-2">
                            Current Status: <span className="capitalize">{order.status}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found for this product.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewOrders(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProducts;
