import React, { useState } from 'react';
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import DocumentModal from '../../components/investor/DocumentModal';

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeModal, setActiveModal] = useState(null);

  const property = {
    id: 1,
    name: "Premium Farmland",
    location: "North Bangalore",
    price: "25,000",
    area: "3.2",
    leaseTerm: "2 years minimum",
    soilType: "Black Cotton",
    waterSource: "Canal + Borewell",
    facilities: "Borewell, Storage Shed, Fencing",
    owner: "Priya Sharma"
  };

  const documents = [
    {
      name: "Land Title & Survey",
      verifiedBy: "Revenue Department",
      status: "Verified",
      type: "land"
    }
  ];

  return (
    <>
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 shadow-lg border border-green-100">
              <div className="bg-gray-200 h-[240px] mb-6 rounded-md"></div>
              
              <h2 className="text-2xl font-semibold mb-1">{property.name}</h2>
              <p className="text-gray-600 mb-2">{property.location}</p>
              <p className="text-green-600 font-semibold mb-6">₹{property.price} per acre/year</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Area</p>
                    <p className="font-medium">{property.area} acres</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lease Terms</p>
                    <p className="font-medium">{property.leaseTerm}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Soil Type</p>
                    <p className="font-medium">{property.soilType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Water Source</p>
                    <p className="font-medium">{property.waterSource}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Documents</h3>
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-500" size={20} />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">Verified by: {doc.verifiedBy}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="text-green-500 border-green-500"
                        onClick={() => setActiveModal(doc.type)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    className="text-green-500 border-green-500"
                    onClick={() => navigate('/investment')}
                  >
                    Back to Listings
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => navigate('/investment/apply/property-details')}
                  >
                    Invest Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <DocumentModal
      isOpen={activeModal === 'land'}
      onClose={() => setActiveModal(null)}
      title="Land Title & Survey"
      type="land"
    />
    </>
  );
};

export default PropertyDetails;