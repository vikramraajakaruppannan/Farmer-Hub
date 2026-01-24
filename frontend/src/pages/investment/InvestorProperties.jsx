import React, { useState } from 'react';
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from 'react-router-dom';
import { MapPin, Droplets } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  return (
    <Card className="h-full flex flex-col">
      <div className="bg-gray-200 h-[240px]"></div>
      <div className="p-6 space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{property.name}</h3>
          <span className="text-green-600 font-semibold whitespace-nowrap">₹{property.price}/year</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Area</p>
            <p className="font-medium">{property.area} acres</p>
          </div>
          <div>
            <p className="text-gray-500">Lease Term</p>
            <p className="font-medium">{property.leaseTerm}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Soil Type</p>
            <p className="font-medium">{property.soilType}</p>
          </div>
          <div className="flex items-start gap-1">
            <Droplets size={16} className="text-blue-500 mt-1 flex-shrink-0" />
            <p className="font-medium">{property.waterSource}</p>
          </div>
        </div>
        
        <div className="flex-grow">
          <p className="text-sm text-gray-500">Available Facilities</p>
          <p className="font-medium text-sm">{property.facilities}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-sm text-gray-500">Owner</p>
            <p className="font-medium">{property.owner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profession</p>
            <p className="font-medium">{property.profession}</p>
          </div>
        </div>
        
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 mt-2" 
          onClick={() => navigate(`/investment/property/${property.id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

const InvestorProperties = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    soilType: '',
    priceRange: ''
  });

  const properties = [
    {
      id: 1,
      name: "Fertile Agricultural Plot",
      price: "25000",
      location: "North Bangalore",
      area: "3.2",
      leaseTerm: "2 years minimum",
      soilType: "Black Cotton",
      waterSource: "Canal + Borewell",
      facilities: "Borewell, Storage Shed, Fencing",
      owner: "Priya Sharma",
      profession: "Software Engineer"
    },
    {
      id: 2,
      name: "Premium Farm Land",
      price: "32000",
      location: "Mysore Rural",
      area: "5.0",
      leaseTerm: "3 years minimum",
      soilType: "Red Sandy Loam",
      waterSource: "River + Rainwater Harvesting",
      facilities: "Irrigation System, Worker Quarters",
      owner: "Rahul Verma",
      profession: "Business Owner"
    },
    {
      id: 3,
      name: "Organic Farming Plot",
      price: "18000",
      location: "Hassan District",
      area: "2.5",
      leaseTerm: "1 year renewable",
      soilType: "Alluvial",
      waterSource: "Natural Spring + Pond",
      facilities: "Organic Certification, Composting Area",
      owner: "Lakshmi Devi",
      profession: "Retired Teacher"
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredProperties = properties.filter(property => {
    return (
      (!filters.location || property.location === filters.location) &&
      (!filters.soilType || property.soilType === filters.soilType) &&
      (!filters.priceRange || (
        filters.priceRange === 'low' && parseInt(property.price) < 20000 ||
        filters.priceRange === 'medium' && parseInt(property.price) >= 20000 && parseInt(property.price) <= 30000 ||
        filters.priceRange === 'high' && parseInt(property.price) > 30000
      ))
    );
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-green-800">Available Properties</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorProperties;