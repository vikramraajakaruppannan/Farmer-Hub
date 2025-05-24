import { useState, useEffect } from "react";
import Navbar from "@/components/investor/Navbar";
import PropertyCard from "@/components/investor/PropertyCard";
import PropertyDetail from "@/components/investor/PropertyDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import BackNav from "@/components/investor/BackNav";
import Footer from "@/components/investor/Footer";

const getUserProperties = () => {
  return JSON.parse(localStorage.getItem("userProperties") || "[]");
};

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState(getUserProperties());

  useEffect(() => {
    const reload = () => setProperties(getUserProperties());
    window.addEventListener("storage", reload);
    return () => window.removeEventListener("storage", reload);
  }, []);

  // Re-read on mount and on register
  useEffect(() => {
    setProperties(getUserProperties());
  }, []);

  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.soilType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.waterSource || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPropertyData = selectedProperty !== null 
    ? properties.find(p => Number(p.id) === Number(selectedProperty)) 
    : null;

  if (selectedPropertyData) {
    return (
      <div className="min-h-screen flex flex-col relative bg-urban-green-50">
        <Navbar />
        <BackNav />
        <main className="flex-grow container mx-auto px-4 py-8">
          <PropertyDetail 
            {...selectedPropertyData}
            onClose={() => setSelectedProperty(null)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-urban-green-50 relative">
      <Navbar />
      <BackNav />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-urban-green-800">Your Registered Properties</h1>
          <Button className="bg-urban-green-500 hover:bg-urban-green-600">
            For Rent
          </Button>
        </div>
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 py-6 rounded-lg"
            placeholder="Search by location, soil type, water source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties registered yet.</p>
            <p className="text-gray-400">Register your first property from the home page!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onViewDetails={() => setSelectedProperty(property.id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Properties;