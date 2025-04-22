import React from 'react';

const ExpertCard = ({ expert, onRequestAppointment }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-md">
      <img 
        src={expert.photo_url || 'https://i.pravatar.cc/150?img=11'} 
        alt={expert.name} 
        className="w-24 h-24 rounded-full mx-auto object-cover" 
      />
      <h3 className="text-xl font-semibold mt-2">{expert.name}</h3>
      <p className="text-gray-600">{expert.specialty}</p>
      <p className="text-gray-500 text-sm">{expert.experience_years} years experience</p>
      <p className="text-gray-500 text-sm">Languages: {expert.languages.join(", ")}</p>
      <p className="text-yellow-500">Rating: {expert.rating.toFixed(1)}</p>
      <button
        className="mt-4 bg-green-200 text-green-800 px-4 py-2 rounded-md hover:bg-green-300"
        onClick={() => onRequestAppointment(expert)}
      >
        Request Appointment
      </button>
    </div>
  );
};

export default ExpertCard;
