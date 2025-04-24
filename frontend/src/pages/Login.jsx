import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Farmer');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (location.state?.signupSuccess) {
      setSuccess(location.state.message);
    }
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      sessionStorage.removeItem('user');
    }
  }, [location.state]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!selectedCategory) newErrors.category = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});
    setSuccess('');
    setIsLoading(true);

    try {
      // Login request
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, category: selectedCategory }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const userData = {
        email: data.email,
        name: `${data.first_name} ${data.last_name}`,
        role: selectedCategory,
      };

      // Store session_id
      localStorage.setItem('session_id', data.session_id);

      // Fetch user_id from /user endpoint
      const userResponse = await fetch('http://localhost:8000/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': data.session_id,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userProfile = await userResponse.json();
      if (!userProfile.id) {
        throw new Error('User ID not found in profile');
      }
      localStorage.setItem('user_id', userProfile.id);

      // Store user data based on rememberMe
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

      toast({
        title: "Login successful!",
        description: `Welcome back, ${userData.name}!`,
      });

      // Redirect based on category
      const redirectPath = selectedCategory === 'Farmer' ? '/dashboard' : '/invest';
      navigate(redirectPath, { replace: true });
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, null, window.location.href);
      };
    } catch (err) {
      setErrors({ auth: err.message || 'Invalid email or password' });
      toast({
        title: 'Login Failed',
        description: err.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-agritech-paleGreen flex items-center justify-center p-4">
      <button 
        className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900"
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        <div className="p-8 md:p-12 w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to your account</p>
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
          {errors.auth && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-500 text-sm">{errors.auth}</p>
            </div>
          )}
          
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
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  className={`w-full pr-10 px-4 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <Link to="/forgot-password" className="text-sm text-agritech-green hover:underline">
                Forgot password?
              </Link>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
            
            <div className="flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                className="h-4 w-4 text-agritech-green focus:ring-agritech-green border-gray-300 rounded" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
                disabled={isLoading} 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-agritech-green font-medium hover:underline">Sign up</Link>
          </p>
          <p className="mt-6 text-center text-sm text-gray-600">
            Are you a buyer who is looking for bulk products? <Link to="/buyer/login" className="text-agritech-green font-medium hover:underline">Hop in</Link>
          </p>
        </div>
        
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