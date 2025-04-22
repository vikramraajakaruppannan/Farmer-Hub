<<<<<<< HEAD
=======

>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
import React from 'react';
import { Link } from 'react-router-dom';

const CommunitySection = () => {
  return (
<<<<<<< HEAD
    <div id="community-section" className="py-16 bg-agritech-paleGreen" style={{ backgroundColor: '#A6E483' }}> {/* ✅ Added id for scroll */}
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 mb-2 text-black" >Join Our Community</h2>
        <p className=" text-black text-gray-700 max-w-2xl mx-auto mb-8 ">
=======
    <div className="py-16 bg-agritech-paleGreen">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
>>>>>>> 6f70c0b46be476d725c023c2c823c7edde59d469
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
