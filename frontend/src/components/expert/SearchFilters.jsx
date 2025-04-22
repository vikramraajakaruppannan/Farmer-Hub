import React from 'react';
import { Search } from 'lucide-react';

const SearchFilters = ({ searchTerm, setSearchTerm, language, setLanguage }) => {
  const languages = ['All', 'English', 'Spanish', 'Hindi', 'French'];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Search experts"
          />
        </div>
       
      </div>
    </div>
  );
};

export default SearchFilters;