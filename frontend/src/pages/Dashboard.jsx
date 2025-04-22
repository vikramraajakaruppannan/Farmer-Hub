<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Scan, Users, BookOpen, Truck, BanknoteIcon } from 'lucide-react';
=======

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Scan, Users, BookOpen, Truck, Phone, Users2, BanknoteIcon } from 'lucide-react';
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const [user, setUser] = useState(null);
<<<<<<< HEAD
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const sessionId = localStorage.getItem('session_id');
    if (storedUser && sessionId) {
      setUser(JSON.parse(storedUser));
      fetchDashboardData(sessionId);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const fetchDashboardData = async (sessionId) => {
    try {
      const response = await fetch('http://localhost:8000/dashboard', {
        headers: { 'X-Session-ID': sessionId },
      });
      if (response.status === 401) {
        localStorage.removeItem('session_id');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        navigate('/login', { replace: true });
      } else if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    }
  };
=======
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">AgriTech Platform</h1>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Welcome back, {user?.name || 'Farmer'}</span>
            <Link to="/profile" className="h-10 w-10 rounded-full bg-agritech-lightGreen/20 flex items-center justify-center text-agritech-darkGreen hover:bg-agritech-lightGreen/30 transition-colors">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </Link>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
=======
        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* AI Crop Disease Scanner */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Scan className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">AI Crop Disease Scanner</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Scan crop images & get instant AI-powered diagnosis.
                </p>
                <Link 
                  to="/disease-detection"
                  className="mt-auto w-full py-2 bg-red-600 text-white text-center rounded-md hover:bg-red-700 transition-colors"
                >
                  Scan Now
                </Link>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
=======
          {/* Farmer-to-Farmer Exchange */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">Farmer-to-Farmer Exchange</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Trade seeds, fertilizers, and tools with fellow farmers.
                </p>
                <Link 
<<<<<<< HEAD
                  to="/market"
=======
                  to="/farmer-exchange"
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
                  className="mt-auto w-full py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Trading
                </Link>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
=======
          {/* Expert Consultation */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">Expert Consultation</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Get expert guidance on farming techniques & crop health.
                </p>
                <Link 
<<<<<<< HEAD
                  to="/expert-connect"
=======
                  to="/expert-consultation"
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
                  className="mt-auto w-full py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors"
                >
                  Ask an Expert
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
=======
        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Urban-to-Farmer Investment */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BanknoteIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">Urban-to-Farmer Investment</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Receive direct investment from urban funders & share profits.
                </p>
                <Link 
<<<<<<< HEAD
                  to="/investments"
=======
                  to="/investment"
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
                  className="mt-auto w-full py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
                >
                  Invest Now
                </Link>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
=======
          {/* Smart Agricultural Supply Chain */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Truck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">Smart Agricultural Supply Chain</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Sell directly to bulk buyers & optimize logistics.
                </p>
                <Link 
                  to="/supply-chain"
                  className="mt-auto w-full py-2 bg-yellow-600 text-white text-center rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Find Buyers
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
=======
        {/* Stats and Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Stats */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Stats & Impact</h3>
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-agritech-green">50,000+</div>
                  <div className="text-sm text-gray-500">Farmers Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">100,000+</div>
                  <div className="text-sm text-gray-500">AI Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">₹25M+</div>
                  <div className="text-sm text-gray-500">Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>

<<<<<<< HEAD
=======
          {/* Testimonials */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Testimonials</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-agritech-green pl-4 py-1">
                  <p className="text-sm italic">"The AI disease detection saved my entire crop. Incredible technology!"</p>
                  <p className="text-sm font-semibold mt-1">- Rajesh Kumar, Farmer</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <p className="text-sm italic">"I've found reliable buyers and better prices through the platform."</p>
                  <p className="text-sm font-semibold mt-1">- Priya Sharma, Farmer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
=======
        {/* Newsletter Section */}
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
        <div className="mt-8">
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <h3 className="text-lg font-semibold mb-4 md:mb-0">Newsletter Signup</h3>
                <div className="flex w-full md:w-auto">
                  <input 
                    type="email" 
                    placeholder="Enter your email to stay updated with farming trends" 
                    className="px-4 py-2 border border-gray-300 rounded-l-md w-full md:w-80"
                  />
                  <button className="bg-agritech-darkGreen text-white px-4 py-2 rounded-r-md hover:bg-agritech-green transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
