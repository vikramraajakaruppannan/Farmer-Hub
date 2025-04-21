import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="aboutus-section" className="scroll-mt-20 bg-green-950 text-white py-10 px-8" style={{ backgroundColor: '#A6E483' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Section */}
        <div>
          <div className="w-[180px] h-[60px] bg-gray-200 mb-4 flex items-center justify-center text-black font-semibold">
            AGRITECH
          </div>
          <p className="font-semibold text-black mb-2">Growing with Intelligence.</p>
          <p className="text-sm text-black mb-4">
            Empowering farmers with innovative AgriTech since 2005.
          </p>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold mb-2 text-black">Features</h4>
          <ul className="space-y-1 text-sm text-black">
            <li><a href="/ai-crop-disease-prediction">AI Predictions</a></li>
            <li><a href="/Farmer-Exchange-Network">Farmer to farmer exchange</a></li>
            <li><a href="/Expert-Consultation-Platform">Expert Consultation</a></li>
            <li><a href="/Urban-To-Farmer-Investment">Urban to Farmer Investment</a></li>
            <li><a href="/Supply-Chain-Bulk-Buyers">Smart Supply chain</a></li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div>
          <h4 className="font-semibold mb-2 text-black">Get In Touch</h4>
          <ul className="space-y-1 text-sm text-black">
            <li className="flex items-center gap-2">
              <FaInstagram /> @agritech.official
            </li>
            <li className="flex items-center gap-2">
              <FaTwitter /> @AgriTechAI
            </li>
            <li className="flex items-center gap-2">
              <FaFacebookF /> fb.com/AgriTechGlobal
            </li>
          </ul>
        </div>

        {/* Smart Farming Button */}
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-green-600 to-green-400 px-6 py-4 rounded-md text-white font-semibold">
            Smart Farming
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-500 mt-10 pt-4 text-sm text-black flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 AgriTech Solutions. All Rights Reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
