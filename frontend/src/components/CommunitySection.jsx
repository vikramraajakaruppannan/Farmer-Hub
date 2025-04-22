import React from 'react';

const CommunitySection = () => {
  return (
    <div id="community-section" className="py-16 bg-agritech-paleGreen"> {/* ✅ Cleaned up background */}
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 text-black">Join Our Community</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
          Connect with thousands of farmers worldwide to share knowledge, trade resources, 
          and grow together.
        </p>
        <a 
          href="https://t.me/+7ACyNro5UVFjZjJl"  
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-md bg-agritech-green text-white font-medium hover:bg-agritech-darkGreen"
        >
          Join Today
        </a>
      </div>
    </div>
  );
};

export default CommunitySection;
