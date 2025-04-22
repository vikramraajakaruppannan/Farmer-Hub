import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Search } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AppointmentModal from '@/components/expert/AppointmentModal';
import SearchFilters from '@/components/expert/SearchFilters';
import ExpertCard from '@/components/expert/ExpertCard';

const ExpertConsultation = () => {
  const [experts, setExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        setError(null);
        const sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          setError('No session ID found. Please log in.');
          navigate('/login');
          return;
        }
        const response = await fetch('http://localhost:8000/experts', {
          headers: {
            'X-Session-ID': sessionId,
          },
        });
        console.log('Experts Fetch Status:', response.status);
        const responseText = await response.text();
        console.log('Experts Fetch Body:', responseText);
        if (response.status === 401) {
          localStorage.removeItem('session_id');
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch experts');
        }
        const data = JSON.parse(responseText);
        console.log('Experts Parsed Data:', data);
        setExperts(data);
      } catch (err) {
        console.error('Fetch Experts Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, [navigate]);

  const filteredExperts = experts.filter((expert) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      expert.name.toLowerCase().includes(searchLower) ||
      expert.specialty.toLowerCase().includes(searchLower);
    const matchesLanguage = language
      ? expert.language.toLowerCase() === language.toLowerCase()
      : true;
    return matchesSearch && matchesLanguage;
  });

  const handleAppointmentRequest = (expert) => {
    setSelectedExpert(expert);
    setShowModal(true);
  };

  const handleExpertRequestClick = () => {
    navigate('/expert-notifications');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8" />
              <h1 className="text-2xl sm:text-3xl font-bold">Consult an Agricultural Expert</h1>
            </div>
            <button
              onClick={handleExpertRequestClick}
              className="bg-white text-green-700 px-4 py-2 rounded-md font-semibold hover:bg-green-100 transition-colors duration-200"
              aria-label="View expert request notifications"
            >
              Expert Requests
            </button>
          </div>
          <p className="mt-2 text-sm opacity-90">Connect with experts for personalized farming guidance</p>
        </div>

        {/* Search Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <p className="ml-2 text-gray-600">Loading experts...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && filteredExperts.length === 0 && (
          <p className="text-gray-600 text-center py-8">No experts found matching your criteria.</p>
        )}

        {/* Experts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map((expert, index) => (
            <div
              key={expert.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ExpertCard
                expert={expert}
                onRequestAppointment={handleAppointmentRequest}
              />
            </div>
          ))}
        </div>

        {/* Appointment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="transform transition-all duration-300 scale-100">
              <AppointmentModal
                expert={selectedExpert}
                onClose={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertConsultation;