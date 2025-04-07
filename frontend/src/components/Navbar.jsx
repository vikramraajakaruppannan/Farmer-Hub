
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-agritech-green flex items-center">
            AgriTech
          </Link>
          
          <div className="hidden md:flex ml-10 space-x-8">
            <Link to="/features" className="text-gray-600 hover:text-agritech-green">Features</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-agritech-green">Pricing</Link>
            <Link to="/about" className="text-gray-600 hover:text-agritech-green">About</Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/login" className="px-4 py-2 rounded-md text-agritech-green border border-agritech-green hover:bg-agritech-paleGreen">
            Log in
          </Link>
          <Link to="/signup" className="px-4 py-2 rounded-md bg-agritech-green text-white hover:bg-agritech-darkGreen">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
