import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New message from AgriTech Support', unread: true, timestamp: '2025-04-12T10:00:00Z' },
    { id: 2, message: 'Weather alert: Heavy rain expected', unread: true, timestamp: '2025-04-12T09:30:00Z' },
    { id: 3, message: 'Your crop scan is complete', unread: false, timestamp: '2025-04-11T15:45:00Z' },
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [dailyTip, setDailyTip] = useState(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [tipError, setTipError] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Handle clicks outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize user and session
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const sessionId = localStorage.getItem('session_id');
    if (storedUser && sessionId) {
      setUser(JSON.parse(storedUser));
    } else {
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: 'Please log in again.',
      });
      navigate('/login', { replace: true });
    }

    // Disable back button
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, toast]);

  // Fetch weather based on location
  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      const apiKey = "d317c11b3ef97793e88be6dd4fb6ffa8";
      if (!apiKey) {
        setWeatherError('Weather API key is missing');
        setWeatherLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const data = await response.json();
        setWeather({
          location: data.name || 'Your Location',
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
        });
        setWeatherError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setWeatherError('Unable to fetch weather data');
      } finally {
        setWeatherLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setWeatherError('Location access denied. Using default location.');
            setWeatherLoading(false);
            fetchWeather(28.6139, 77.2090);
          },
          { timeout: 10000 }
        );
      } else {
        setWeatherError('Geolocation not supported by your browser.');
        setWeatherLoading(false);
        fetchWeather(28.6139, 77.2090);
      }
    };

    getLocation();
  }, []);

  // Fetch daily tip
  useEffect(() => {
    const fetchDailyTip = async () => {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        setTipError('Session not found');
        setTipLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/daily-tip', {
          headers: { 'X-Session-ID': sessionId },
        });
        if (!response.ok) throw new Error('Failed to fetch daily tip');
        const data = await response.json();
        setDailyTip(data.tip);
        setTipError(null);
      } catch (err) {
        console.error('Tip fetch error:', err);
        setTipError('Unable to fetch daily tip');
      } finally {
        setTipLoading(false);
      }
    };

    fetchDailyTip();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        setEventsError('Session not found');
        setEventsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/events', {
          headers: { 'X-Session-ID': sessionId },
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data.events);
        setEventsError(null);
      } catch (err) {
        console.error('Events fetch error:', err);
        setEventsError('Unable to fetch events');
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      localStorage.removeItem('user');
      localStorage.removeItem('session_id');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) throw new Error('Logout failed');

      localStorage.removeItem('user');
      localStorage.removeItem('session_id');
      toast({
        title: 'Success',
        description: 'Logged out successfully.',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log out. Please try again.',
      });
    }
  };

  // Handle notification read/unread
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => notif.unread).length;

  // Handle download with error checking
  const handleDownload = async (fileName) => {
    try {
      const response = await fetch(`/pdfs/${fileName}`);
      if (!response.ok) throw new Error('File not found');
      
      toast({
        title: 'Download Started',
        description: `${fileName} is downloading.`,
      });
    } catch (err) {
      console.error('Download error:', err);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: `Unable to download ${fileName}. Please try again.`,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">AgriTech Platform</h1>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Button */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-agritech-green"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-lg shadow-xl z-10 animate-fade-in">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-4 border-b border-gray-100 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                            notif.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className={notif.unread ? 'font-medium text-gray-800' : 'text-gray-600'}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="w-full p-3 text-sm text-red-600 hover:bg-gray-100 transition-colors text-center"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Button */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm sm:text-base hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-agritech-green"
                aria-label="User menu"
              >
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 animate-fade-in">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full p-3 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <Card className="mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">
              {weather ? `${weather.location} Weather` : 'Local Weather'}
            </h2>
            {weatherLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-agritech-green"></div>
              </div>
            ) : weatherError ? (
              <p className="text-sm text-red-600">{weatherError}</p>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-end">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-800">
                    {weather?.temp}°C
                  </span>
                  <span className="ml-2 text-base sm:text-lg text-gray-600">
                    {weather?.condition}
                  </span>
                </div>
                <div className="flex gap-6 sm:gap-8">
                  <div className="text-right">
                    <div className="text-gray-500 text-sm">Humidity</div>
                    <div className="text-lg sm:text-xl font-semibold">{weather?.humidity}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-sm">Wind Speed</div>
                    <div className="text-lg sm:text-xl font-semibold">{weather?.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-500 rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-2">AI Crop Disease Scanner</h3>
              <p className="text-gray-600 text-sm mb-4">
                Scan crops & get instant AI diagnoses
              </p>
              <Link 
                to="/disease-detection"
                className="block w-full py-2 bg-red-500 text-white text-center rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                Scan Now
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500 rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Farmer-to-Farmer Exchange</h3>
              <p className="text-gray-600 text-sm mb-4">
                Trade tools/seeds with other farmers
              </p>
              <Link 
                to="/market-home"
                className="block w-full py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Start Trading
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-purple-500 rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Expert Consultation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get personalized advice from agri experts
              </p>
              <Link 
                to="/expert-consultation"
                className="block w-full py-2 bg-purple-500 text-white text-center rounded-md hover:bg-purple-600 transition-colors text-sm sm:text-base"
              >
                Ask an Expert
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Urban-to-Farmer Investment</h3>
              <p className="text-gray-600 text-sm mb-4">
                Receive funding from urban backers for growth
              </p>
              <Link 
                to="/investment"
                className="block w-full py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Invest Now
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Smart Agri Supply Chain</h3>
              <p className="text-gray-600 text-sm mb-4">
                Sell directly to buyers & streamline logistics
              </p>
              <Link 
                to="/supply-chain"
                className="block w-full py-2 bg-orange-500 text-white text-center rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                Find Buyers
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Events and Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <Card className="overflow-hidden shadow-sm rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Upcoming Agricultural Events</h3>
              {eventsLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-agritech-green"></div>
                </div>
              ) : eventsError ? (
                <p className="text-sm text-red-600">{eventsError}</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming events found.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-green-100 rounded-md flex items-center justify-center text-green-600 mr-3">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm sm:text-base">{event.name}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500">{event.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm rounded-lg">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Daily Tip</h3>
              {tipLoading ? (
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-agritech-green"></div>
                </div>
              ) : tipError ? (
                <p className="text-sm text-red-600">{tipError}</p>
              ) : (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{dailyTip}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Free Resource Downloads */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold">Free Resource Downloads</h3>
            <span className="text-xs text-gray-500">
              Access useful PDFs on sustainable agriculture and more
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="overflow-hidden shadow-sm rounded-lg">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">New</div>
                </div>
                <h4 className="font-medium mb-1 text-sm sm:text-base">Sustainable Farming Guide</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">2.0MB</span>
                  <a
                    href="/pdfs/Sustainable_Farming_Guide.pdf"
                    download
                    onClick={() => handleDownload('Sustainable_Farming_Guide.pdf')}
                    className="text-green-600 text-sm flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-agritech-green"
                    aria-label="Download Sustainable Farming Guide"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-sm rounded-lg">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">Popular</div>
                </div>
                <h4 className="font-medium mb-1 text-sm sm:text-base">Organic Fertilizer Usage</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">1.0MB</span>
                  <a
                    href="/pdfs/organic_fertilizer_usage.pdf"
                    download
                    onClick={() => handleDownload('organic_fertilizer_usage.pdf')}
                    className="text-green-600 text-sm flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-agritech-green"
                    aria-label="Download Organic Fertilizer Usage"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-sm rounded-lg">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">Updated</div>
                </div>
                <h4 className="font-medium mb-1 text-sm sm:text-base">Water Conservation in Agriculture</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">2.9MB</span>
                  <a
                    href="/pdfs/Water_Conservation_for_Agriculture.pdf"
                    download
                    onClick={() => handleDownload('Water_Conservation_for_Agriculture.pdf')}
                    className="text-green-600 text-sm flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-agritech-green"
                    aria-label="Download Water Conservation in Agriculture"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
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