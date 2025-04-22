import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Globe2 } from 'lucide-react'; // Optional: you can replace with an <img> if you prefer

const Navbar = () => {
  useEffect(() => {
    const addGoogleTranslate = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,ta',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };

    addGoogleTranslate();
  }, []);

  return (
    <nav className="bg-white shadow-sm py-4 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">

        {/* Left Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/000/626/625/small/patempat-03.jpg"
            alt="AgriTech Logo"
            className="h-10 w-auto"
          />
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-green-800">AgriTech</h1>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex space-x-10 font-medium text-gray-800">
          <ScrollLink to="features-section" smooth={true} offset={-80} duration={600} className="cursor-pointer hover:text-green-700">
            Features
          </ScrollLink>
          <ScrollLink to="community-section" smooth={true} offset={-80} duration={600} className="cursor-pointer hover:text-green-700">
            Community
          </ScrollLink>
          <ScrollLink to="aboutus-section" smooth={true} offset={-80} duration={600} className="cursor-pointer hover:text-green-700">
            About Us
          </ScrollLink>
        </div>

        {/* Right: Translator + SignUp */}
        <div className="flex items-center space-x-4">
          {/* Styled Google Translate Box */}
          <div className="relative">
            <div className="flex items-center space-x-2 px-3 py-1.5 border rounded-md bg-green-50 text-green-900 text-sm shadow-sm">
              <Globe2 size={16} className="text-green-700" />
              <span className="font-medium">EN</span>
            </div>
            <div
              id="google_translate_element"
              className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-auto"
            ></div>
          </div>

          {/* Sign Up Button */}
          <Link
            to="/login"
            className="px-4 py-2 rounded-md bg-green-700 text-white font-medium hover:bg-green-800 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
