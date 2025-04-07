
import React from 'react';

const Stats = () => {
  const stats = [
    { number: '15,000+', label: 'Farmers using AgriTech' },
    { number: '250+', label: 'Communities' },
    { number: '20+', label: 'Active Years' },
    { number: '$10M+', label: 'Revenue Generated' }
  ];

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-2xl md:text-3xl font-bold text-agritech-green">{stat.number}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
