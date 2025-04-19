import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AppointmentModal from '../components/AppointmentModal';
import SearchFilters from '../components/expert/SearchFilters';
import ExpertCard from '../components/expert/ExpertCard';

const experts = [
  {
    id: 1,
    name: "Dr. Ravi Kumar",
    specialty: "Soil & Crop Disease Specialist",
    experience: "12 years experience",
    languages: ["English", "Hindi"],
    rating: 4.8,
    status: "Available Now",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    specialty: "Organic Farming Expert",
    experience: "15 years experience",
    languages: ["English", "Mandarin"],
    rating: 4.9,
    status: "Available Now",
    image: "https://i.pravatar.cc/150?img=32"
  },
  {
    id: 3,
    name: "Dr. John Smith",
    specialty: "Pest Management Specialist",
    experience: "10 years experience",
    languages: ["English", "Spanish"],
    rating: 4.7,
    status: "In Session",
    image: "https://i.pravatar.cc/150?img=15"
  },
  {
    id: 4,
    name: "Dr. Maria Garcia",
    specialty: "Sustainable Agriculture Expert",
    experience: "8 years experience",
    languages: ["English", "Spanish"],
    rating: 4.6,
    status: "Available Now",
    image: "https://i.pravatar.cc/150?img=23"
  }
];

const ExpertConsultation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const availableExperts = experts.filter(e => e.status === "Available Now").length;
  
  const filteredExperts = experts.filter(expert => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expert.name.toLowerCase().includes(searchLower) ||
      expert.specialty.toLowerCase().includes(searchLower)
    );
  });

  const handleAppointmentRequest = (expert) => {
    setSelectedExpert(expert);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f0fff4]">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Consult an Agricultural Expert</h1>
            <span className="text-green-600 font-semibold">Available Experts: {availableExperts}</span>
          </div>
          <p className="text-gray-600">Get expert guidance for your farming needs</p>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          cropType={cropType}
          setCropType={setCropType}
          soilType={soilType}
          setSoilType={setSoilType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExperts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onRequestAppointment={handleAppointmentRequest}
            />
          ))}
        </div>

        {showModal && (
          <AppointmentModal
            expert={selectedExpert}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ExpertConsultation;
