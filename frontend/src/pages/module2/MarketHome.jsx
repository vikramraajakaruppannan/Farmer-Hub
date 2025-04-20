import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { ShoppingBasket, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const MarketHome = () => {
  const navigate = useNavigate();

  // Testimonial data (mock)
  const testimonials = [
    {
      name: 'Ravi Sharma',
      role: 'Farmer',
      quote: 'This platform has made it so easy to sell my organic produce directly to buyers!',
    },
    {
      name: 'Anita Patel',
      role: 'Buyer',
      quote: 'I love the variety of eco-friendly products available. The quality is top-notch!',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-agritech-darkGreen mb-4">
              Welcome to Green Products Marketplace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect directly with farmers to buy and sell eco-friendly, organic, and sustainable agricultural products.
            </p>
            <Button
              className="mt-6 bg-agritech-green text-white hover:bg-agritech-darkGreen"
              onClick={() => navigate('/market')}
            >
              Start Shopping <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Call to Action Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="hover:shadow-lg transition-shadow rounded-xl">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="h-16 w-16 bg-agritech-paleGreen rounded-full flex items-center justify-center mb-6">
                    <ShoppingBasket className="h-8 w-8 text-agritech-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-agritech-darkGreen mb-4">Looking to Buy?</h2>
                  <p className="text-gray-600 text-center mb-6">
                    Browse our collection of eco-friendly and sustainable products from trusted farmers.
                  </p>
                  <Button
                    className="w-full bg-agritech-green hover:bg-agritech-darkGreen text-white"
                    onClick={() => navigate('/market')}
                  >
                    Explore Products
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="hover:shadow-lg transition-shadow rounded-xl">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="h-16 w-16 bg-agritech-paleGreen rounded-full flex items-center justify-center mb-6">
                    <Tag className="h-8 w-8 text-agritech-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-agritech-darkGreen mb-4">Want to Sell?</h2>
                  <p className="text-gray-600 text-center mb-6">
                    List your eco-friendly products and manage your listings with ease.
                  </p>
                  <Button
                    className="w-full bg-agritech-green hover:bg-agritech-darkGreen text-white"
                    onClick={() => navigate('/manage-products')}
                  >
                    Sell a Product
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Testimonials */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h3 className="text-2xl font-semibold text-agritech-darkGreen mb-6 text-center">
              What Our Users Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="border-l-4 border-agritech-green pl-4"
                >
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <p className="font-medium text-agritech-darkGreen">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Track Orders CTA */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-agritech-darkGreen mb-4">
              Already placed an order?
            </h3>
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