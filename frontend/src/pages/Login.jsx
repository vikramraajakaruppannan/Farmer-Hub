import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Farmer');
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!selectedCategory) newErrors.category = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user with matching email, password, and category
      const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.category === selectedCategory
      );
      
      if (user) {
        // Store user info in localStorage (except password)
        const { password: _, ...userInfo } = user;
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        // Show success toast
        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Check if user exists with different category
        const userExists = users.some(u => 
          u.email === email && 
          u.password === password && 
          u.category !== selectedCategory
        );
        
        if (userExists) {
          setErrors({
            auth: `No account found for this email as a ${selectedCategory}. Please try another category.`
          });
        } else {
          setErrors({
            auth: "Invalid email or password"
          });
        }
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#A6E483' }}>
      
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Left side - Login form */}
        <div className="p-8 md:p-12 w-full md:w-1/2">
        <Link to="/" className="flex items-center text-sm text-agritech-green hover:underline mb-4">
        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to your account</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                id="email"
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-agritech-green hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Category</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Farmer')}
                  className={`flex-1 h-16 relative border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedCategory === 'Farmer' 
                      ? 'border-agritech-green bg-agritech-paleGreen' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedCategory === 'Farmer' && (
                    <span className="absolute top-2 right-2 text-agritech-green">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-agritech-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Farmer</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Investor')}
                  className={`flex-1 h-16 relative border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedCategory === 'Investor' 
                      ? 'border-agritech-green bg-agritech-paleGreen' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedCategory === 'Investor' && (
                    <span className="absolute top-2 right-2 text-agritech-green">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-agritech-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Investor</span>
                </button>
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-2 text-center">{errors.category}</p>}
            </div>
            
            {errors.auth && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-500 text-sm">{errors.auth}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green"
            >
              Sign In
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-agritech-green font-medium hover:underline">Sign up</Link>
          </p>
        </div>
        
        {/* Right side - Image and info */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1661808770389-30a3ed35b7fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGFncmljdWx0dXJlJTIwZmllbGR8ZW58MHx8MHx8fDA%3D')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
                <h3 className="ml-2 text-sm font-medium text-white">Secure Login</h3>
              </div>
              <p className="text-xs text-white/80">Protected with encryption</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-auto">
              <h3 className="text-xl font-bold text-white mb-2">Welcome to AgriTech</h3>
              <p className="text-white/80">Continue your journey with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
