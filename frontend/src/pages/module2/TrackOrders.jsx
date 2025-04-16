import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Check, Package, Truck, Home, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const statusOptions = [
  { id: 'pending', name: 'Pending', icon: Clock, color: 'text-amber-500' },
  { id: 'packed', name: 'Packed', icon: Package, color: 'text-blue-500' },
  { id: 'shipped', name: 'Shipped', icon: Truck, color: 'text-purple-500' },
  { id: 'delivered', name: 'Delivered', icon: CheckCircle, color: 'text-green-500' }
];

const TrackOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [lastStatusMap, setLastStatusMap] = useState({});
  
  useEffect(() => {
    // Get orders from localStorage
    const fetchOrders = () => {
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Sort orders by date (newest first)
      const sortedOrders = storedOrders.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setOrders(sortedOrders);
      
      // Store current status of each order to detect changes
      const currentStatusMap = {};
      sortedOrders.forEach(order => {
        currentStatusMap[order.id] = order.status;
      });
      
      // Check if any status has changed since last render
      Object.keys(currentStatusMap).forEach(orderId => {
        if (lastStatusMap[orderId] && lastStatusMap[orderId] !== currentStatusMap[orderId]) {
          // Status changed, show notification
          const order = sortedOrders.find(o => o.id.toString() === orderId);
          const newStatus = currentStatusMap[orderId];
          const statusDetails = statusOptions.find(s => s.id === newStatus);
          
          toast({
            title: `Order #${orderId} Updated`,
            description: `Your order status has changed to: ${statusDetails.name}`,
          });
        }
      });
      
      setLastStatusMap(currentStatusMap);
    };
    
    // Initial fetch
    fetchOrders();
    
    // Poll for changes (for real-time updates)
    const interval = setInterval(fetchOrders, 3000);
    
    return () => clearInterval(interval);
  }, [toast, lastStatusMap]);

  const getStatusIndex = (status) => {
    return statusOptions.findIndex(option => option.id === status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderOrderStatus = (status) => {
    const statusIndex = getStatusIndex(status);
    const StatusIcon = statusOptions[statusIndex].icon;
    
    return (
      <div className="flex items-center">
        <StatusIcon className={`h-5 w-5 ${statusOptions[statusIndex].color} mr-2`} />
        <span className="font-medium">{statusOptions[statusIndex].name}</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-agritech-green">Track Your Orders</h1>
            <Button 
              className="bg-agritech-green text-white"
              onClick={() => navigate('/market')}
            >
              Continue Shopping
            </Button>
          </div>
          
          <Tabs defaultValue="current">
            <TabsList className="mb-6">
              <TabsTrigger value="current">Current Orders</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              {orders.filter(order => order.status !== 'delivered').length > 0 ? (
                <div className="space-y-6">
                  {orders
                    .filter(order => order.status !== 'delivered')
                    .map(order => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="bg-agritech-paleGreen px-5 py-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Order #{order.id}</p>
                              <p className="text-xs text-gray-500">Placed on {formatDate(order.date)}</p>
                            </div>
                            {renderOrderStatus(order.status)}
                          </div>
                          
                          <div className="p-5">
                            <div className="flex items-start">
                              <img 
                                src={order.product.image} 
                                alt={order.product.name} 
                                className="w-20 h-20 object-cover rounded-md mr-3"
                              />
                              <div>
                                <h3 className="font-medium text-agritech-darkGreen">{order.product.name}</h3>
                                <p className="text-sm text-gray-600">
                                  Qty: {order.quantity} {order.product.unit}
                                </p>
                                <p className="text-sm font-medium text-agritech-green mt-1">
                                  ₹{order.totalAmount}
                                </p>
                              </div>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="relative space-y-6 mb-6">
                              {statusOptions.map((status, index) => {
                                const isActive = getStatusIndex(order.status) >= index;
                                const Icon = status.icon;
                                
                                return (
                                  <div key={status.id} className="flex items-start">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                      isActive 
                                        ? 'bg-agritech-green text-white' 
                                        : 'bg-gray-200 text-gray-400'
                                    }`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="ml-4">
                                      <p className={`font-medium ${isActive ? 'text-agritech-darkGreen' : 'text-gray-500'}`}>
                                        {status.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {isActive ? 'Completed' : 'Pending'}
                                      </p>
                                    </div>
                                    {index < statusOptions.length - 1 && (
                                      <div className={`absolute ml-4 mt-8 h-12 w-0.5 ${
                                        isActive && statusOptions[index + 1].id !== order.status
                                          ? 'bg-agritech-green' 
                                          : 'bg-gray-200'
                                      }`}></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="text-right">
                              <Button 
                                variant="outline" 
                                className="text-agritech-green border-agritech-green hover:bg-agritech-paleGreen"
                                onClick={() => navigate(`/market`)}
                              >
                                View Similar Products
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Current Orders</h3>
                  <p className="text-gray-500 mb-6">You don't have any pending orders right now.</p>
                  <Button 
                    className="bg-agritech-green text-white"
                    onClick={() => navigate('/market')}
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="delivered">
              {orders.filter(order => order.status === 'delivered').length > 0 ? (
                <div className="space-y-6">
                  {orders
                    .filter(order => order.status === 'delivered')
                    .map(order => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="bg-green-50 px-5 py-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">Order #{order.id}</p>
                              <p className="text-xs text-gray-500">Placed on {formatDate(order.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-medium">Delivered</span>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <div className="flex items-start">
                              <img 
                                src={order.product.image} 
                                alt={order.product.name} 
                                className="w-20 h-20 object-cover rounded-md mr-3"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-agritech-darkGreen">{order.product.name}</h3>
                                <p className="text-sm text-gray-600">
                                  Qty: {order.quantity} {order.product.unit}
                                </p>
                                <div className="flex justify-between mt-1">
                                  <p className="text-sm font-medium text-agritech-green">
                                    ₹{order.totalAmount}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>Delivered on {formatDate(order.date)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 text-right">
                              <Button 
                                variant="outline" 
                                className="text-agritech-green border-agritech-green hover:bg-agritech-paleGreen"
                                onClick={() => navigate(`/market`)}
                              >
                                Buy Again
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Delivered Orders</h3>
                  <p className="text-gray-500 mb-6">You don't have any delivered orders yet.</p>
                  <Button 
                    className="bg-agritech-green text-white"
                    onClick={() => navigate('/market')}
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TrackOrders;
