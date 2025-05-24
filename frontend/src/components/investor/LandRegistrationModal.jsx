import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const initialState = {
  title: "",
  location: "",
  area: "",
  price: "",
  soilType: "",
  waterSource: "",
  description: "",
  ownerName: "",
  phone: "",
  email: "",
  readyToInvest: "",
};

const LandRegistrationModal = ({ isOpen, onClose, onSubmitProperty, property }) => {
  const [form, setForm] = useState(initialState);

  // Pre-fill form with property data when editing
  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || "",
        location: property.location || "",
        area: property.acres?.toString() || "",
        price: property.price?.toString() || "",
        soilType: property.soilType || "",
        waterSource: property.waterSource || "",
        description: property.description || "",
        ownerName: property.owner?.name || "",
        phone: property.phone || "",
        email: property.email || "",
        readyToInvest: property.readyToInvest || "",
      });
    } else {
      setForm(initialState);
    }
  }, [property]);

  const handleInput = (e) => {
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
  };

  const handleSelect = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prop = {
      id: property?.id || Date.now(), // Reuse existing ID for edits, or generate new one
      title: form.title,
      location: form.location,
      price: Number(form.price),
      acres: Number(form.area),
      leaseTerms: property?.leaseTerms || "Custom terms", // Preserve existing leaseTerms
      soilType: form.soilType,
      waterSource: form.waterSource,
      readyToInvest: form.readyToInvest,
      facilities: property?.facilities || [], // Preserve existing facilities
      preferredCrops: property?.preferredCrops || [], // Preserve existing preferredCrops
      owner: {
        name: form.ownerName,
        profession: property?.owner?.profession || "", // Preserve existing profession
      },
      description: form.description,
      phone: form.phone,
      email: form.email,
      thumbnail: property?.thumbnail || "", // Preserve existing thumbnail
    };
    onSubmitProperty(prop);
    setForm(initialState);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center text-urban-green-800 mb-3 sm:mb-4">
            {property ? "Edit Property" : "Register Your Land"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm sm:text-base text-gray-700">Property Title*</Label>
            <Input
              id="title"
              value={form.title}
              onChange={handleInput}
              className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
              placeholder="Enter property title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm sm:text-base text-gray-700">Location*</Label>
            <Input
              id="location"
              value={form.location}
              onChange={handleInput}
              className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
              placeholder="Enter property location"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm sm:text-base text-gray-700">Total Area (acres)*</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                min="0.1"
                value={form.area}
                onChange={handleInput}
                className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm sm:text-base text-gray-700">Asking Price (₹)*</Label>
              <Input
                id="price"
                type="number"
                min="1000"
                value={form.price}
                onChange={handleInput}
                className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="soilType" className="text-sm sm:text-base text-gray-700">Soil Type*</Label>
              <Select onValueChange={(v) => handleSelect("soilType", v)} value={form.soilType}>
                <SelectTrigger id="soilType" className="border-urban-green-200 text-sm sm:text-base">
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black Cotton">Black Cotton</SelectItem>
                  <SelectItem value="Red Soil">Red Soil</SelectItem>
                  <SelectItem value="Alluvial">Alluvial</SelectItem>
                  <SelectItem value="Laterite">Laterite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterSource" className="text-sm sm:text-base text-gray-700">Water Source*</Label>
              <Select onValueChange={(v) => handleSelect("waterSource", v)} value={form.waterSource}>
                <SelectTrigger id="waterSource" className="border-urban-green-200 text-sm sm:text-base">
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Borewell">Borewell</SelectItem>
                  <SelectItem value="Canal">Canal</SelectItem>
                  <SelectItem value="River Nearby">River Nearby</SelectItem>
                  <SelectItem value="Rain-dependent">Rain-dependent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="readyToInvest" className="text-sm sm:text-base text-gray-700">Investment Status*</Label>
            <Select onValueChange={(v) => handleSelect("readyToInvest", v)} value={form.readyToInvest}>
              <SelectTrigger id="readyToInvest" className="border-urban-green-200 text-sm sm:text-base">
                <SelectValue placeholder="Select investment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ready">Ready to Invest</SelectItem>
                <SelectItem value="Not Ready">Not Ready to Invest</SelectItem>
                <SelectItem value="In Progress">Investment In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base text-gray-700">Property Description*</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={handleInput}
              className="min-h-[60px] sm:min-h-[80px] border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
              placeholder="Describe your property..."
              required
            />
          </div>
          <div className="pt-3 sm:pt-4 border-t">
            <h3 className="font-medium text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-sm sm:text-base text-gray-700">Owner Name*</Label>
                <Input
                  id="ownerName"
                  value={form.ownerName}
                  onChange={handleInput}
                  className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base text-gray-700">Phone Number*</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={handleInput}
                  className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 mt-3 sm:mt-4">
              <Label htmlFor="email" className="text-sm sm:text-base text-gray-700">Email Address*</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleInput}
                className="border-urban-green-200 focus:border-urban-green-400 text-sm sm:text-base"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-urban-green-200 text-urban-green-700 hover:bg-urban-green-50 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-urban-green-600 hover:bg-urban-green-700 text-white text-sm sm:text-base"
            >
              {property ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LandRegistrationModal;