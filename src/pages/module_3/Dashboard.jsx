// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import { 
//   Scan, 
//   Users, 
//   BookOpen, 
//   Truck, 
//   Phone, 
//   Download, 
//   Calendar, 
//   Droplet, 
//   CloudSun,
//   Bell
// } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();
//   const [unseenCount, setUnseenCount] = useState(0);

//   useEffect(() => {
//     // Get user from localStorage
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }

//     // Load and calculate unseen count from localStorage
//     const updateUnseenCount = () => {
//       const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
//       const unseen = notifications.filter(n => n.status === 'pending').length;
//       setUnseenCount(unseen);
//     };

//     updateUnseenCount(); // Initial count

//     const interval = setInterval(updateUnseenCount, 5000); // Update every 5 seconds

//     return () => clearInterval(interval);
//   }, [navigate]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
      
//       <div className="flex-1 p-6">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-xl font-bold">AgriTech Platform</h1>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center text-sm">
//               <span className="mr-1">English</span>
//               <span>▼</span>
//             </div>
//             <div className="relative">
//               <Bell className="h-6 w-6 text-gray-600 cursor-pointer" onClick={() => navigate('/dashboard/notifications')} />
//               {unseenCount > 0 && (
//                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-xs">
//                   {unseenCount}
//                 </span>
//               )}
//             </div>
//             <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
//               {user ? user.name.charAt(0).toUpperCase() : 'U'}
//             </div>
//           </div>
//         </div>

//         {/* Weather Card */}
//         <Card className="mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//           <CardContent className="p-6">
//             <h2 className="text-md font-semibold text-gray-700 mb-2">Purple Region Weather</h2>
//             <div className="flex justify-between items-center">
//               <div>
//                 <div className="flex items-end">
//                   <span className="text-4xl font-bold">28°C</span>
//                   <span className="ml-2 text-gray-600">Sunny</span>
//                 </div>
//               </div>
//               <div className="flex gap-8">
//                 <div className="text-right">
//                   <div className="text-gray-500 text-sm">Humidity</div>
//                   <div className="text-xl font-semibold">45%</div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-gray-500 text-sm">Wind Speed</div>
//                   <div className="text-xl font-semibold">12 km/h</div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Main Features */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           {/* AI Crop Disease Scanner */}
//           <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-500">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-1">AI Crop Disease Scanner</h3>
//               <p className="text-gray-600 text-sm mb-4">
//                 Scan crops & get instant AI diagnoses
//               </p>
//               <Link 
//                 to="/disease-detection"
//                 className="block w-full py-2 bg-red-500 text-white text-center rounded-md hover:bg-red-600 transition-colors"
//               >
//                 Scan Now
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Farmer-to-Farmer Exchange */}
//           <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-1">Farmer-to-Farmer Exchange</h3>
//               <p className="text-gray-600 text-sm mb-4">
//                 Trade tools/seeds with other farmers
//               </p>
//               <Link 
//                 to="/market-home"
//                 className="block w-full py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition-colors"
//               >
//                 Start Trading
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Expert Consultation Card */}
//           <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-1">Expert Consultation</h3>
//               <p className="text-gray-600 text-sm mb-4">
//                 Get personalized advice from agri experts
//               </p>
//               <Link 
//                 to="/expert-consultation"
//                 className="block w-full py-2 bg-purple-500 text-white text-center rounded-md hover:bg-purple-600 transition-colors"
//               >
//                 Ask an Expert
//               </Link>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Secondary Features */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           {/* Urban-to-Farmer Investment */}
//           <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-1">Urban-to-Farmer Investment</h3>
//               <p className="text-gray-600 text-sm mb-4">
//                 Receive funding from urban backers for growth
//               </p>
//               <Link 
//                 to="/investment"
//                 className="block w-full py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
//               >
//                 Invest Now
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Smart Agricultural Supply Chain */}
//           <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-1">Smart Agri Supply Chain</h3>
//               <p className="text-gray-600 text-sm mb-4">
//                 Sell directly to buyers & streamline logistics
//               </p>
//               <Link 
//                 to="/supply-chain"
//                 className="block w-full py-2 bg-orange-500 text-white text-center rounded-md hover:bg-orange-600 transition-colors"
//               >
//                 Find Buyers
//               </Link>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Events and Tips */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           {/* Upcoming Agricultural Events */}
//           <Card className="overflow-hidden shadow-sm">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-4">Upcoming Agricultural Events</h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center">
//                     <div className="h-10 w-10 bg-green-100 rounded-md flex items-center justify-center text-green-600 mr-3">
//                       <Calendar className="h-5 w-5" />
//                     </div>
//                     <span className="font-medium">Organic Farming Webinar</span>
//                   </div>
//                   <span className="text-sm text-gray-500">April 18</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center">
//                     <div className="h-10 w-10 bg-amber-100 rounded-md flex items-center justify-center text-amber-600 mr-3">
//                       <Calendar className="h-5 w-5" />
//                     </div>
//                     <span className="font-medium">National AgriTech Expo</span>
//                   </div>
//                   <span className="text-sm text-gray-500">May 4</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Daily Tip */}
//           <Card className="overflow-hidden shadow-sm">
//             <CardContent className="p-4">
//               <h3 className="text-md font-semibold mb-4">Daily Tip</h3>
//               <div className="bg-blue-50 p-3 rounded-md">
//                 <p className="text-sm text-gray-700">"Check soil moisture levels daily for optimal crop health and water conservation."</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Free Resource Downloads */}
//         <div className="mb-4">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-md font-semibold">Free Resource Downloads</h3>
//             <span className="text-xs text-gray-500">Access useful PDFs on sustainable agriculture and more</span>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card className="overflow-hidden shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
//                     <Download className="h-5 w-5" />
//                   </div>
//                   <div className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">New</div>
//                 </div>
//                 <h4 className="font-medium mb-1">Sustainable Farming Guide</h4>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-gray-500">2.4MB</span>
//                   <button className="text-green-600 text-sm flex items-center gap-1">
//                     <Download className="h-3 w-3" />
//                     Download
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
            
//             <Card className="overflow-hidden shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
//                     <Download className="h-5 w-5" />
//                   </div>
//                   <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">Popular</div>
//                 </div>
//                 <h4 className="font-medium mb-1">Organic Fertilizer Usage</h4>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-gray-500">1.8MB</span>
//                   <button className="text-green-600 text-sm flex items-center gap-1">
//                     <Download className="h-3 w-3" />
//                     Download
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
            
//             <Card className="overflow-hidden shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex justify-between items-start mb-2">
//                   <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
//                     <Download className="h-5 w-5" />
//                   </div>
//                   <div className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">Updated</div>
//                 </div>
//                 <h4 className="font-medium mb-1">Water Conservation in Agriculture</h4>
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs text-gray-500">3.3MB</span>
//                   <button className="text-green-600 text-sm flex items-center gap-1">
//                     <Download className="h-3 w-3" />
//                     Download
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Scan, 
  Users, 
  BookOpen, 
  Truck, 
  Phone, 
  Download, 
  Calendar, 
  Droplet, 
  CloudSun,
  Bell
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [unseenCount, setUnseenCount] = useState(0);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false); // State to toggle dropdown
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // State for selected language

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load and calculate unseen count from localStorage
    const updateUnseenCount = () => {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const unseen = notifications.filter(n => n.status === 'pending').length;
      setUnseenCount(unseen);
    };

    updateUnseenCount(); // Initial count

    const interval = setInterval(updateUnseenCount, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setIsLanguageOpen(false); // Close dropdown after selection
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">AgriTech Platform</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="flex items-center text-sm cursor-pointer"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <span className="mr-1">{selectedLanguage}</span>
                <span>▼</span>
              </div>
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-white border rounded-md shadow-lg z-10">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleLanguageChange('English')}
                  >
                    English
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleLanguageChange('Tamil')}
                  >
                    Tamil
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600 cursor-pointer" onClick={() => navigate('/dashboard/notifications')} />
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-xs">
                  {unseenCount}
                </span>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <Card className="mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-md font-semibold text-gray-700 mb-2">Purple Region Weather</h2>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">28°C</span>
                  <span className="ml-2 text-gray-600">Sunny</span>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <div className="text-gray-500 text-sm">Humidity</div>
                  <div className="text-xl font-semibold">45%</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-sm">Wind Speed</div>
                  <div className="text-xl font-semibold">12 km/h</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* AI Crop Disease Scanner */}
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-500">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-1">AI Crop Disease Scanner</h3>
              <p className="text-gray-600 text-sm mb-4">
                Scan crops & get instant AI diagnoses
              </p>
              <Link 
                to="/disease-detection"
                className="block w-full py-2 bg-red-500 text-white text-center rounded-md hover:bg-red-600 transition-colors"
              >
                Scan Now
              </Link>
            </CardContent>
          </Card>

          {/* Farmer-to-Farmer Exchange */}
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-1">Farmer-to-Farmer Exchange</h3>
              <p className="text-gray-600 text-sm mb-4">
                Trade tools/seeds with other farmers
              </p>
              <Link 
                to="/market-home"
                className="block w-full py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition-colors"
              >
                Start Trading
              </Link>
            </CardContent>
          </Card>

          {/* Expert Consultation Card */}
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-1">Expert Consultation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get personalized advice from agri experts
              </p>
              <Link 
                to="/expert-consultation"
                className="block w-full py-2 bg-purple-500 text-white text-center rounded-md hover:bg-purple-600 transition-colors"
              >
                Ask an Expert
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Urban-to-Farmer Investment */}
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-1">Urban-to-Farmer Investment</h3>
              <p className="text-gray-600 text-sm mb-4">
                Receive funding from urban backers for growth
              </p>
              <Link 
                to="/investment"
                className="block w-full py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
              >
                Invest Now
              </Link>
            </CardContent>
          </Card>

          {/* Smart Agricultural Supply Chain */}
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-1">Smart Agri Supply Chain</h3>
              <p className="text-gray-600 text-sm mb-4">
                Sell directly to buyers & streamline logistics
              </p>
              <Link 
                to="/supply-chain"
                className="block w-full py-2 bg-orange-500 text-white text-center rounded-md hover:bg-orange-600 transition-colors"
              >
                Find Buyers
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Events and Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Upcoming Agricultural Events */}
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-4">Upcoming Agricultural Events</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-md flex items-center justify-center text-green-600 mr-3">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Organic Farming Webinar</span>
                  </div>
                  <span className="text-sm text-gray-500">April 18</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-amber-100 rounded-md flex items-center justify-center text-amber-600 mr-3">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="font-medium">National AgriTech Expo</span>
                  </div>
                  <span className="text-sm text-gray-500">May 4</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Tip */}
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-md font-semibold mb-4">Daily Tip</h3>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">"Check soil moisture levels daily for optimal crop health and water conservation."</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Resource Downloads */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold">Free Resource Downloads</h3>
            <span className="text-xs text-gray-500">Access useful PDFs on sustainable agriculture and more</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">New</div>
                </div>
                <h4 className="font-medium mb-1">Sustainable Farming Guide</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">2.4MB</span>
                  <button className="text-green-600 text-sm flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">Popular</div>
                </div>
                <h4 className="font-medium mb-1">Organic Fertilizer Usage</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">1.8MB</span>
                  <button className="text-green-600 text-sm flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">Updated</div>
                </div>
                <h4 className="font-medium mb-1">Water Conservation in Agriculture</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">3.3MB</span>
                  <button className="text-green-600 text-sm flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;