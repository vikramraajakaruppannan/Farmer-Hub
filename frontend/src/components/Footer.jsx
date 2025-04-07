
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-bold mb-4">AgriTech</h3>
            <p className="text-sm text-gray-600 mb-4">
              Empowering farmers with AI and community insights.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-500">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features/ai" className="text-gray-600 hover:text-agritech-green">AI Predictions</Link></li>
              <li><Link to="/features/tracking" className="text-gray-600 hover:text-agritech-green">Resource Tracking</Link></li>
              <li><Link to="/features/community" className="text-gray-600 hover:text-agritech-green">Community</Link></li>
              <li><Link to="/features/investment" className="text-gray-600 hover:text-agritech-green">Investment Tools</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-500">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-agritech-green">About Us</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-agritech-green">Blog</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-agritech-green">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-agritech-green">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-500">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-agritech-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-gray-600">123 Farm Street, CA, USA</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-agritech-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span className="text-gray-600">info@agritech.com</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-agritech-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">© 2024 AgriTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
