import React from 'react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
  return (
    <div id="about-section" className="py-16 bg-white"> {/* ✅ Added id for scroll */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h2 className="text-3xl font-bold mb-6">About AgriTech</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2003, AgriTech is on a mission to revolutionize farming worldwide by combining cutting-edge AI 
              technology with community-driven insights. We're dedicated to empowering farmers to increase yields while 
              reducing resource usage and environmental impact.
            </p>
            <p className="text-gray-700 mb-4">
              Our team consists of agricultural experts, data scientists, and developers who are passionate about building
              technology that addresses real farming challenges around the world.
            </p>
          </div>
          <div className="md:w-1/3 w-full mx-auto">
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFncmljdWx0dXJlfGVufDB8fDB8fHww" 
              alt="Harvester in field at sunset" 
              className="rounded-lg shadow-lg w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
