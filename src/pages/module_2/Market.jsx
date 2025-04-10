
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search, MapPin, User, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Market = () => {
  const [activeTab, setActiveTab] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
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
        description: 'High-quality organic tomato seeds from heirloom varieties. These seeds have been carefully selected for disease resistance and high yield.'
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
        description: 'Nutrient-rich natural compost made from organic materials. This compost is perfect for enriching soil and promoting healthy plant growth.'
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
        description: 'Environmentally friendly bio pesticide that effectively controls pests without harming beneficial insects.'
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
        description: "Traditional heirloom corn seeds passed down through generations. These non-GMO seeds produce sweet, flavorful corn."
      },
      {
        id: 5,
        name: 'Organic Fish Emulsion',
        category: 'Fertilizers',
        quantity: 100,
        unit: 'L',
        price: 180,
        owner: 'James Miller',
        location: 'Riverside Farm',
        image: '/lovable-uploads/dfae19bc-0068-4451-9902-2b41432ac120.png',
        description: 'Liquid fertilizer made from fish byproducts. Rich in nitrogen and other essential nutrients that promote healthy plant growth.'
      },
      {
        id: 6,
        name: 'Neem Oil Spray',
        category: 'Pesticides',
        quantity: 20,
        unit: 'L',
        price: 220,
        owner: 'Emma Brown',
        location: 'Mountain View',
        image: '/lovable-uploads/e748ea16-1c32-432e-a630-245153964862.png',
        description: 'Natural neem oil spray that works as both an insecticide and fungicide. Effective against a wide range of common garden pests and diseases.'
      }
    ];

    // Get seller products from local storage
    const sellerProducts = JSON.parse(localStorage.getItem('sellerProducts') || '[]');
    
    // Combine mock data with seller products
    setProducts([...items, ...sellerProducts]);
  }, []);

  const filteredItems = products.filter(item => {
    if (activeTab !== 'All Items' && item.category !== activeTab) {
      return false;
    }

    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.owner.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleItemClick = (itemId) => {
    navigate(`/product/${itemId}`);
  };

  const handleBuyNow = (itemId) => {
    // Save the selected product ID and navigate to delivery page
    localStorage.setItem('selectedProductId', itemId);
    const selectedProduct = products.find(item => item.id === itemId);
    localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    localStorage.setItem('selectedQuantity', 1); // Default quantity
    navigate(`/delivery/${itemId}`);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to previous page
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
        
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-agritech-green">Green Products Marketplace</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-agritech-green border-agritech-green"
                onClick={() => navigate('/track-orders')}
              >
                Track Orders
              </Button>
              <Button 
                className="bg-agritech-green text-white"
                onClick={() => navigate('/manage-products')}
              >
                Sell a Product
              </Button>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name, farmer, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agritech-green"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button
              className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'All Items'
                  ? 'bg-agritech-green text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('All Items')}
            >
              All Items
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'Seeds'
                  ? 'bg-agritech-green text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('Seeds')}
            >
              Seeds
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'Fertilizers'
                  ? 'bg-agritech-green text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('Fertilizers')}
            >
              Fertilizers
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'Pesticides'
                  ? 'bg-agritech-green text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('Pesticides')}
            >
              Pesticides
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'Tools'
                  ? 'bg-agritech-green text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleTabChange('Tools')}
            >
              Tools
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onClick={() => handleItemClick(item.id)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <h3 
                    className="text-lg font-semibold text-agritech-darkGreen cursor-pointer"
                    onClick={() => handleItemClick(item.id)}
                  >
                    {item.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-1">Category: {item.category}</p>
                <p className="text-sm text-gray-500 mb-2">Available: {item.quantity} {item.unit}</p>
                <p className="text-lg font-semibold text-agritech-green mb-2">₹{item.price}/{item.unit}</p>
                
                <div className="flex items-center mb-3 text-sm">
                  <User className="h-4 w-4 mr-1 text-agritech-green" />
                  <span>{item.owner}</span>
                </div>
                
                <div className="flex items-center text-sm mb-4">
                  <MapPin className="h-4 w-4 mr-1 text-agritech-green" />
                  <span>{item.location}</span>
                </div>
                
                <Button 
                  className="w-full bg-agritech-green text-white hover:bg-agritech-darkGreen"
                  onClick={() => handleBuyNow(item.id)}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No items found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
