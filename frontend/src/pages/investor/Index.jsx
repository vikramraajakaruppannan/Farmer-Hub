import { useState } from "react";
import { Check, FileCheck, Search } from "lucide-react";
import Navbar from "@/components/investor/Navbar";
import ServiceCard from "@/components/investor/ServiceCard";
import LandRegistrationModal from "@/components/investor/LandRegistrationModal";
import UserProfile from "@/components/investor/UserProfile";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/investor/Footer";

const Index = () => {
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [submittedProperty, setSubmittedProperty] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmitProperty = (property) => {
    const prev = JSON.parse(localStorage.getItem("userProperties") || "[]");
    localStorage.setItem("userProperties", JSON.stringify([property, ...prev]));
    setSubmittedProperty(property);
    window.dispatchEvent(new Event("storage"));
    import("@/components/ui/sonner").then(({ toast }) => {
      toast.success("Land registration submitted successfully!");
      setTimeout(() => navigate('/properties'), 850);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-urban-green-50">
      <div className="relative">
        <Navbar profileClick={() => setProfileOpen(!profileOpen)} />
        {profileOpen && (
          <div className="absolute top-16 right-4 z-20">
            <UserProfile onClose={() => setProfileOpen(false)} />
          </div>
        )}
      </div>
      <main className="flex-grow container mx-auto px-2 md:px-4 py-8 w-full relative">
        <section className="bg-white rounded-2xl shadow-md p-8 mb-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              title="Land Listing"
              description="List your agricultural land easily and connect with verified farmers"
              icon={<FileCheck className="w-7 h-7 text-urban-green-600" />}
              actionLabel="Register Land"
              onAction={() => setRegistrationModalOpen(true)}
            />
            <ServiceCard
              title="Secure Transactions"
              description="Safe and verified payment processing for all rentals"
              icon={<Check className="w-7 h-7 text-urban-green-600" />}
            />
            <ServiceCard
              title="Support"
              description="24/7 customer support for all your needs"
              icon={<Search className="w-7 h-7 text-urban-green-600" />}
              actionLabel="Browse Properties"
              onAction={() => navigate('/properties')}
            />
          </div>
        </section>
        <section className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">For Landowners</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-urban-green-100 text-urban-green-600 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </span>
                <span>Easy listing process</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-urban-green-100 text-urban-green-600 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </span>
                <span>Verified farmers</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-urban-green-100 text-urban-green-600 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </span>
                <span>Secure payments</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">For Farmers</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-urban-green-100 text-urban-green-600 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </span>
                <span>Browse available land</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-urban-green-100 text-urban-green-600 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </span>
                <span>Flexible rental terms</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-urban-green-100 text-urban-green-600 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </span>
                <span>Direct communication</span>
              </li>
            </ul>
          </div>
        </section>
        <LandRegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          onSubmitProperty={handleSubmitProperty}
        />
        <Footer />
      </main>
    </div>
  );
};

export default Index;