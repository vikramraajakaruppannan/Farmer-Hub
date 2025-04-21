import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    category: 'Farmer'
  });
  
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation for confirm password
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword' && value !== formData.password) {
        setErrors({...errors, confirmPassword: "Passwords do not match"});
      } else if (name === 'password' && value !== formData.confirmPassword && formData.confirmPassword) {
        setErrors({...errors, confirmPassword: "Passwords do not match"});
      } else {
        setErrors({...errors, confirmPassword: null});
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.category) newErrors.category = "Please select a category";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkIfUserExists = () => {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if a user with the same email and category already exists
    const userWithEmailExists = users.some(user => 
      user.email === formData.email && 
      user.category === formData.category
    );
    
    // Check if a user with the same mobile and category already exists
    const userWithMobileExists = users.some(user => 
      user.mobile === formData.mobile && 
      user.category === formData.category
    );
    
    return { userWithEmailExists, userWithMobileExists };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Check if user already exists
      const { userWithEmailExists, userWithMobileExists } = checkIfUserExists();
      
      if (userWithEmailExists) {
        setErrors(prev => ({
          ...prev,
          email: `Account with this email already exists for the ${formData.category} category`
        }));
        return;
      }
      
      if (userWithMobileExists) {
        setErrors(prev => ({
          ...prev,
          mobile: `Account with this mobile number already exists for the ${formData.category} category`
        }));
        return;
      }
      
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Add new user (excluding confirmPassword)
      const { confirmPassword, ...userToSave } = formData;
      users.push(userToSave);
      
      // Save updated users list
      localStorage.setItem('users', JSON.stringify(users));
      
      // Also save current user info for auto-login
      const { password, ...userInfo } = userToSave;
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // Show success toast
      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    }
  };

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#A6E483' }}>
     
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        
        
        {/* left side - Signup form */}
        <div className="p-8 md:p-12 w-full md:w-1/2">
         <Link to="/" className="flex items-center text-sm text-agritech-green hover:underline mb-4">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
          
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Category</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleCategorySelect('Farmer')}
                  className={`flex-1 h-16 relative border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.category === 'Farmer' 
                      ? 'border-agritech-green bg-agritech-paleGreen' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {formData.category === 'Farmer' && (
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
                  onClick={() => handleCategorySelect('Investor')}
                  className={`flex-1 h-16 relative border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.category === 'Investor' 
                      ? 'border-agritech-green bg-agritech-paleGreen' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {formData.category === 'Investor' && (
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
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                id="name"
                name="name"
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input 
                  type="tel" 
                  id="mobile"
                  name="mobile"
                  className={`w-full px-4 py-2 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  name="password"
                  className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-agritech-green focus:border-agritech-green`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-agritech-green text-white py-3 px-4 rounded-md hover:bg-agritech-darkGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agritech-green mt-2"
            >
              Create Account
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-agritech-green font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        {/* right side - Image and info */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWdyaWN1bHR1cmV8ZW58MHx8MHx8fDA%3D')" }}>
          <div className="h-full flex flex-col justify-between p-12 bg-gradient-to-b from-black/30 to-black/50">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 self-end">
              <div className="flex items-center mb-2">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
                <h3 className="ml-2 text-sm font-medium text-white">Secure Sign Up</h3>
              </div>
              <p className="text-xs text-white/80">Protected with encryption</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-auto">
              <h3 className="text-xl font-bold text-white mb-2">Welcome to AgriTech</h3>
              <p className="text-white/80">Start your journey with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;










