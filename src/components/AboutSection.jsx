
import React from 'react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
  return (
    <div className="py-16 bg-white">
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
            <Link 
              to="/about" 
              className="inline-block text-agritech-green font-medium hover:underline"
            >
              Read More
            </Link>
          </div>
          <div className="md:w-1/2">
            <img 
              src="" 
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
