import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="aboutus-section" className="scroll-mt-20 bg-agritech-paleGreen text-black py-10 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <div className="w-[180px] h-[60px] bg-white mb-4 flex items-center justify-center text-black font-semibold shadow-md">
            AGRITECH
          </div>
          <p className="font-semibold mb-2">Growing with Intelligence.</p>
          <p className="text-sm">
            Empowering farmers with innovative AgriTech since 2005.
          </p>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/ai-crop-disease-prediction" className="hover:underline">AI Predictions</a></li>
            <li><a href="/Farmer-Exchange-Network" className="hover:underline">Farmer to farmer exchange</a></li>
            <li><a href="/Expert-Consultation-Platform" className="hover:underline">Expert Consultation</a></li>
            <li><a href="/Urban-To-Farmer-Investment" className="hover:underline">Urban to Farmer Investment</a></li>
            <li><a href="/Supply-Chain-Bulk-Buyers" className="hover:underline">Smart Supply Chain</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold mb-2">Get In Touch</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaInstagram className="text-lg" />
              <a
                href="https://www.instagram.com/agritech.official"
                target="_blank"
                rel="noopener noreferrer"
              >
                agritech.official
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaTwitter className="text-lg" />
              <a
                href="https://twitter.com/AgriTechAI"
                target="_blank"
                rel="noopener noreferrer"
              >
                AgriTechAI
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaFacebookF className="text-lg" />
              <a
                href="https://facebook.com/AgriTechGlobal"
                target="_blank"
                rel="noopener noreferrer"
              >
                AgriTechGlobal
              </a>
            </li>
          </ul>
        </div>


        {/* Smart Farming CTA */}
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-agritech-green to-agritech-darkGreen px-6 py-4 rounded-md text-white font-semibold shadow-lg">
            Smart Farming
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-400 mt-10 pt-4 text-sm flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 AgriTech Solutions. All Rights Reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/privacy-policy" >Privacy Policy</a>
          <a href="/terms-and-conditions" >Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
