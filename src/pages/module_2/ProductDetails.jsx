
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { ArrowLeft, User, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    // In a real app, you would fetch product data from an API
    // For this demo, we'll use mock data
    const items = [
      {
        id: 1,
        name: 'Organic Tomato Seeds',
        category: 'Seeds',
        quantity: 12,
        unit: 'kg',
        price: 150,
        owner: 'John Smith',
        location: 'Springfield Valley',
        image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
        description: 'High-quality organic tomato seeds from heirloom varieties. These seeds have been carefully selected for disease resistance and high yield. Perfect for both small gardens and commercial farming.'
      },
      {
        id: 2,
        name: 'Natural Compost',
        category: 'Fertilizers',
        quantity: 250,
        unit: 'kg',
        price: 75,
        owner: 'Mary Johnson',
        location: 'Green Acres',
        image: '/lovable-uploads/e748ea16-1c32-432e-a630-245153964862.png',
        description: 'Nutrient-rich natural compost made from organic materials. This compost is perfect for enriching soil and promoting healthy plant growth. Free from synthetic chemicals and safe for all types of crops.'
      },
      {
        id: 3,
        name: 'Bio Pesticide',
        category: 'Pesticides',
        quantity: 50,
        unit: 'L',
        price: 200,
        owner: 'Robert Wilson',
        location: 'Harvest Hills',
        image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
        description: 'Environmentally friendly bio pesticide that effectively controls pests without harming beneficial insects. Made from natural ingredients and safe for use on all food crops.'
      },
      {
        id: 4,
        name: 'Heirloom Corn Seeds',
        category: 'Seeds',
        quantity: 30,
        unit: 'kg',
        price: 120,
        owner: 'Sarah Davis',
        location: 'Sunflower Fields',
        image: '/lovable-uploads/e748ea16-1c32-432e-a630-245153964862.png',
        description: "Traditional heirloom corn seeds passed down through generations. These non-GMO seeds produce sweet, flavorful corn that's perfect for direct consumption or processing."
      },
    ];
    
    // Also check seller products from local storage
    const sellerProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    const allProducts = [...items, ...sellerProducts];
    
    const product = allProducts.find(p => p.id.toString() === id.toString());
    if (product) {
      setProduct(product);
    }
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };
  
  const handleBuyNow = () => {
    // Save selected product and quantity to localStorage
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    localStorage.setItem('selectedQuantity', quantity);
    localStorage.setItem('selectedProductId', product.id);
    
    // Navigate to delivery page
    navigate(`/delivery/${id}`);
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
                
                <div className="mb-6">
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-agritech-green mr-2" />
                    <span className="text-gray-700">Seller: {product.owner}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-agritech-green mr-2" />
                    <span className="text-gray-700">Location: {product.location}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-agritech-green mr-2" />
                    <span className="text-gray-700">Home Delivery Available</span>
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
                  
                  <Button 
                    className="w-full bg-agritech-green hover:bg-agritech-darkGreen"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
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
