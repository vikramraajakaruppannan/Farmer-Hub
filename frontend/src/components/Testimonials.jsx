import React from "react";

const Testimonial = ({ image, name, location, quote }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-[300px] flex-shrink-0 mx-4">
      <div className="flex items-center mb-4">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
      location: "Iowa, USA",
      quote: "AI predictions increased my yield by 24%! Revolutionary.",
    },
    {
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      name: "Maria Singh",
      location: "Punjab, India",
      quote: "User-friendly platform helped me grow my farm efficiently.",
    },
    {
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      name: "Peter Miller",
      location: "Canada",
      quote: "Community support is amazing. Love being part of AgriTech.",
    },
    {
      image: "https://randomuser.me/api/portraits/women/55.jpg",
      name: "Anita Reddy",
      location: "Andhra Pradesh",
      quote: "Crop prediction features are very helpful!",
    },
    {
      image: "https://randomuser.me/api/portraits/men/77.jpg",
      name: "James Howard",
      location: "Texas, USA",
      quote: "AgriTech gives me essential insights to scale smartly.",
    },
  ];

  // Duplicate testimonials for infinite loop illusion
  const scrollingTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="relative py-16 bg-white overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-12 text-green-800">What Farmers Say</h2>

      {/* Fading Overlays */}
      <div className="absolute left-0 top-0 w-24 h-full z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-24 h-full z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

      <div className="w-full overflow-hidden">
        <div className="flex animate-scroll gap-4">
          {scrollingTestimonials.map((t, i) => (
            <Testimonial
              key={i}
              image={t.image}
              name={t.name}
              location={t.location}
              quote={t.quote}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
