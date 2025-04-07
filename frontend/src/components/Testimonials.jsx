
import React from 'react';

const Testimonial = ({ image, name, location, rating, quote }) => {
  return (
    <div className="testimonial-card bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
      <p className="text-gray-700 italic">"{quote}"</p>
    </div>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "Tom Wilson",
      location: "Iowa Farmer, USA",
      rating: 5,
      quote: "The AI predictions have increased my yield by 24%! Absolutely revolutionary for my family's farm."
    },
    {
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      name: "Peter Miller",
      location: "Ontario, Canada",
      rating: 5,
      quote: "I've been working with AgriTech farmers for many years and the community support is amazing."
    },
    {
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      name: "Maria Singh",
      location: "Punjab, India",
      rating: 5,
      quote: "As a newcomer to digital agriculture, the AgriTech's platform is incredibly user-friendly. My farm has become more efficient."
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Farmers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              image={testimonial.image}
              name={testimonial.name}
              location={testimonial.location}
              rating={testimonial.rating}
              quote={testimonial.quote}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
