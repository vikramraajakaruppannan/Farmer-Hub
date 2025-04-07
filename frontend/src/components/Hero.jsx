
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="hero-section relative text-center py-20 md:py-32">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Revolutionizing Farming with AI <br/> & Community Power
        </h1>
        <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto">
          Enhance efficiency, predict harvests, track resources, and increase productivity
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/signup" className="px-6 py-3 rounded-md bg-agritech-green text-white font-medium hover:bg-agritech-darkGreen">
            Get Started
          </Link>
          <Link to="/demo" className="px-6 py-3 rounded-md border border-white text-white font-medium hover:bg-white/20">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
