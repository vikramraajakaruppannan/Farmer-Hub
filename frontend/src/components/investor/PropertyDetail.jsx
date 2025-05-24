import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import LandRegistrationModal from "./LandRegistrationModal";

const PropertyDetail = ({
  id,
  title,
  location,
  price,
  perYear = true,
  acres,
  leaseTerms,
  soilType,
  waterSource,
  readyToInvest,
  facilities,
  preferredCrops,
  owner,
  description,
  phone,
  email,
  onClose,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isInvestor = user.category === "Investor";

  const handleEditSubmit = (updatedProperty) => {
    const properties = JSON.parse(localStorage.getItem("userProperties") || "[]");
    const updatedProperties = properties.map((p) =>
      p.id === id ? { ...p, ...updatedProperty } : p
    );

    localStorage.setItem("userProperties", JSON.stringify(updatedProperties));
    window.dispatchEvent(new Event("storage"));
    toast.success("Property updated successfully!");
    setIsEditModalOpen(false);
    onClose();
  };

  // Prepare property data to pass to the modal
  const propertyData = {
    id,
    title,
    location,
    price,
    acres,
    leaseTerms,
    soilType,
    waterSource,
    readyToInvest,
    facilities,
    preferredCrops,
    owner,
    description,
    phone,
    email,
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          {isInvestor && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="h-[300px] bg-gray-200 rounded-lg flex items-center justify-center mb-6">
          <span className="text-gray-400">Property Image Placeholder</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium text-urban-green-600">
                  ₹{price.toLocaleString()}
                  {perYear ? "/acre/year" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Area</p>
                <p className="font-medium">{acres} acres</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lease Terms</p>
                <p className="font-medium">{leaseTerms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Soil Type</p>
                <p className="font-medium">{soilType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Water Source</p>
                <p className="font-medium">{waterSource}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

            {readyToInvest && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Investment Status</p>
                <Badge
                  variant="outline"
                  className={`
                    ${
                      readyToInvest === "Ready"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : readyToInvest === "Not Ready"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-yellow-50 border-yellow-200 text-yellow-700"
                    }
                  `}
                >
                  {readyToInvest}
                </Badge>
              </div>
            )}

            {facilities.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Available Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((facility, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-urban-green-50 border-urban-green-200"
                    >
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {preferredCrops.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Preferred Crops</p>
                <div className="flex flex-wrap gap-2">
                  {preferredCrops.map((crop, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-urban-green-50 border-urban-green-200"
                    >
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">About the Owner</h4>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-urban-green-100 rounded-full flex items-center justify-center text-urban-green-800 font-medium">
                  {owner.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{owner.name}</p>
                  <p className="text-sm text-gray-500">
                    Profession: {owner.profession}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button className="bg-urban-green-500 hover:bg-urban-green-600 px-8">
            Request to Rent
          </Button>
        </div>
      </div>

      <LandRegistrationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmitProperty={handleEditSubmit}
        property={propertyData} // Pass the current property data
      />
    </div>
  );
};

export default PropertyDetail;