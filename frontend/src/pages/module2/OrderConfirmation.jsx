
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { CheckCircle, Package, Truck, ShoppingBag, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    // Show success toast
    toast({
      title: "Order Placed Successfully!",
      description: `Order #${id} has been confirmed and is being processed.`,
    });
    
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find(order => order.id.toString() === id);
    
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [id, toast]);

  const handleDownloadInvoice = () => {
    if (!order) return;
    
    const doc = new jsPDF();
    
    // Add header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AgriTech - Invoice", 20, 20);
    
    // Add order info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Order #: ${order.id}`, 20, 40);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 50);
    
    // Add product info
    doc.text("Product Details:", 20, 70);
    doc.text(`Product: ${order.product.name}`, 25, 80);
    doc.text(`Quantity: ${order.quantity} ${order.product.unit}`, 25, 90);
    doc.text(`Price: ₹${order.product.price}/${order.product.unit}`, 25, 100);
    
    // Add delivery info
    doc.text("Delivery Information:", 20, 120);
    doc.text(`Name: ${order.deliveryInfo.fullName}`, 25, 130);
    doc.text(`Address: ${order.deliveryInfo.address}`, 25, 140);
    doc.text(`City: ${order.deliveryInfo.city}, ${order.deliveryInfo.state} ${order.deliveryInfo.pinCode}`, 25, 150);
    doc.text(`Phone: ${order.deliveryInfo.phoneNumber}`, 25, 160);
    
    // Add payment info
    doc.text("Payment Details:", 20, 180);
    doc.text(`Payment Method: ${order.paymentMethod || 'Google Pay (GPay)'}`, 25, 190);
    doc.text(`Subtotal: ₹${order.product.price * order.quantity}`, 25, 200);
    doc.text(`Delivery Fee: ₹40`, 25, 210);
    doc.text(`Total Amount: ₹${order.totalAmount}`, 25, 220);
    
    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for shopping with AgriTech!", 20, 260);
    
    // Save PDF
    doc.save(`AgriTech_Invoice_${order.id}.pdf`);
    
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully.",
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to previous page
  };

  if (!order) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p>Loading order details...</p>
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
          className="mb-6 p-2 h-auto"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-agritech-paleGreen p-6 text-center">
              <CheckCircle className="h-16 w-16 text-agritech-green mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-agritech-darkGreen mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>
              <p className="text-lg font-medium text-agritech-green mt-2">
                Order #{order.id}
              </p>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Order Details</h2>
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
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-agritech-green mr-3" />
                  <div>
                    <p className="font-medium">Delivery Status</p>
                    <p className="text-sm text-gray-600">Order Pending</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-agritech-green mr-3" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">3-5 business days</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-agritech-green mr-3" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-gray-600">{order.paymentMethod || 'Google Pay (GPay)'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-agritech-green hover:bg-agritech-darkGreen flex-1"
                  onClick={() => navigate(`/track-orders`)}
                >
                  Track Your Order
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-agritech-green text-agritech-green hover:bg-agritech-paleGreen flex-1"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="h-4 w-4 mr-2" /> Download Invoice
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-gray-500"
                onClick={() => navigate('/market')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
