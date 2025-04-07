
import React from 'react';
import { Link } from 'react-router-dom';

const CommunitySection = () => {
  return (
    <div className="py-16 bg-agritech-paleGreen">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
          Connect with thousands of farmers worldwide to share knowledge, trade resources, 
          and grow together.
        </p>
        <Link 
          to="/community" 
          className="inline-block px-6 py-3 rounded-md bg-agritech-green text-white font-medium hover:bg-agritech-darkGreen"
        >
          Join Today
        </Link>
      </div>
    </div>
  );
};

export default CommunitySection;
