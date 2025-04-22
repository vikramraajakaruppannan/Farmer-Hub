import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const imageUrls = [
  "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Green farm landscape
  "https://plus.unsplash.com/premium_photo-1661962614000-3f4205cab031?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fGhhcnZlc3RpbmclMjBmYXJtZXJ8ZW58MHx8MHx8fDA%3D", // Farmer with tablet
  "https://plus.unsplash.com/premium_photo-1733259933803-fe5fc98b88f4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFybWVyJTIwYW5kJTIwcGVvcGxlJTIwaGFuZHNoYWtlfGVufDB8fDB8fHwwhttps://images.unsplash.com/photo-1658869163471-81665d648612?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybWVyJTIwYW5kJTIwcGVvcGxlJTIwaGFuZHNoYWtlfGVufDB8fDB8fHww", // Tractor in field
  "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhcm1lciUyMHdpdGglMjBmcml1dHMlMjBhbmQlMjB2ZWdldGFibGVzfGVufDB8fDB8fHww", // Drone flying over field=aSREO-vx-zHdVGVn6rcRJ2OmLoJ5W2q6k5grNWUQQVg=",
];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div
      className="hero-section relative text-center py-20 md:py-32 bg-center bg-cover transition-all duration-1000"
      style={{ backgroundImage: `url('${imageUrls[currentImage]}')` }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Revolutionizing Farming with AI <br /> & Community Power
        </h1>
        <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto">
          Enhance efficiency, predict harvests, track resources, and increase productivity
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/signup"
            className="px-6 py-3 rounded-md bg-agritech-green text-white font-medium hover:bg-agritech-darkGreen"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
