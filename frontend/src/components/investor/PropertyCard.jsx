import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const PropertyCard = ({
  title,
  location,
  price,
  perYear = true,
  acres,
  leaseTerms,
  soilType,
  waterSource,
  facilities,
  preferredCrops,
  owner,
  onViewDetails,
}) => {
  return (
    <Card className="overflow-hidden card-hover">
      <div className="h-[200px] bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">600 × 400</span>
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-gray-600 text-sm">{location}</p>
          </div>
          <div className="text-right">
            <p className="text-urban-green-600 font-bold">₹{price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{perYear ? 'per acre/year' : ''}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <p className="text-sm text-gray-500">Total Area</p>
            <p>{acres} acres</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lease Terms</p>
            <p>{leaseTerms}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Soil Type</p>
            <p>{soilType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Water Source</p>
            <p>{waterSource}</p>
          </div>
        </div>
        
        {facilities.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Available Facilities</p>
            <p>{facilities.join(', ')}</p>
          </div>
        )}
        
        {preferredCrops.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Preferred Crops</p>
            <p>{preferredCrops.join(', ')}</p>
          </div>
        )}
        
        <div className="flex items-center mt-4 pt-3 border-t">
          <div className="w-6 h-6 bg-urban-green-100 rounded-full flex items-center justify-center text-xs text-urban-green-800">
            {owner.name.charAt(0)}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">Owner: {owner.name}</p>
            <p className="text-xs text-gray-500">Profession: {owner.profession}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-3">
        <Button 
          onClick={onViewDetails}
          className="w-full bg-urban-green-500 hover:bg-urban-green-600"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;