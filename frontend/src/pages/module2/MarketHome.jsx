
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { ShoppingBasket, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MarketHome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-agritech-green mb-4">Green Products Marketplace</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Welcome to our sustainable marketplace where you can buy and sell eco-friendly, 
              organic, and sustainable agricultural products directly with other farmers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="h-16 w-16 bg-agritech-paleGreen rounded-full flex items-center justify-center mb-6">
                  <ShoppingBasket className="h-8 w-8 text-agritech-green" />
                </div>
                <h2 className="text-xl font-semibold text-agritech-darkGreen mb-4">Looking to Buy?</h2>
                <p className="text-gray-600 text-center mb-6">
                  Browse our collection of eco-friendly and sustainable products 
                  from trusted farmers. Purchase directly with just a few clicks.
                </p>
                <Button 
                  className="w-full bg-agritech-green hover:bg-agritech-darkGreen text-white"
                  onClick={() => navigate('/market')}
                >
                  Explore Products
                </Button>
              </CardContent>
            </Card>
            
            {/* Seller Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="h-16 w-16 bg-agritech-paleGreen rounded-full flex items-center justify-center mb-6">
                  <Tag className="h-8 w-8 text-agritech-green" />
                </div>
                <h2 className="text-xl font-semibold text-agritech-darkGreen mb-4">Want to Sell?</h2>
                <p className="text-gray-600 text-center mb-6">
                  List your eco-friendly products directly on our platform. 
                  Manage your listings and track orders in one place.
                </p>
                <Button 
                  className="w-full bg-agritech-green hover:bg-agritech-darkGreen text-white"
                  onClick={() => navigate('/manage-products')}
                >
                  Sell a Product
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium text-agritech-darkGreen mb-4">Already placed an order?</h3>
            <Button 
              variant="outline" 
              className="text-agritech-green border-agritech-green hover:bg-agritech-paleGreen"
              onClick={() => navigate('/track-orders')}
            >
              Track Your Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHome;
