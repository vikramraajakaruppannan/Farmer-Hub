// src/pages/Index.jsx
import React, { useState } from "react";
import {
  Check,
  FileCheck,
  Search,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/investor/Navbar"; 
import DocumentModal from "@/components/investor/DocumentModal";


// Service Card Component
const ServiceCard = ({ title, description, icon, actionLabel, onAction }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-green-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-600/10 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-500" />

      <div className="relative flex flex-col justify-between h-full">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-green-700/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-700 to-green-800 flex items-center justify-center shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
              <div className="text-white w-7 h-7">{icon}</div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-700 group-hover:to-green-800 transition-all duration-300">
            {title}
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {description}
          </p>
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="relative w-full py-3 px-8 rounded-lg text-lg font-semibold overflow-hidden bg-white text-green-800 border border-gray-200 shadow-md hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span className="relative flex items-center justify-center gap-2">
              {actionLabel}
              <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
            </span>
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-700 via-green-600 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
    </div>
  );
};

// Main Index Component
const Index = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const navigate = useNavigate();

  const landownerFeatures = [
    { title: "Easy listing process", desc: "List your agricultural land with complete details in minutes" },
    { title: "Verified farmers", desc: "Connect with trusted and verified farmers only" },
    { title: "Secure payments", desc: "Safe, transparent, and timely payment handling" },
  ];

  const farmerFeatures = [
    { title: "Browse available land", desc: "Find farmland that suits your needs and location" },
    { title: "Flexible rental terms", desc: "Choose rental periods that work best for you" },
    { title: "Direct communication", desc: "Connect directly with landowners easily" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-agritech-paleGreen">
      {/* Use imported Navbar */}
      <Navbar profileClick={() => setProfileOpen(true)} />

      {/* Profile Sidebar - rendered by Navbar internally */}
      {/* No need to render UserProfile here anymore — it's inside Navbar component */}

      {/* Registration / Document Modal */}
      <DocumentModal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        title="Land Registration Document" // optional prop if you added it
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Invest in Agriculture, Grow the Future
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Connect with farmers, invest in land, and be part of sustainable agriculture
            </p>
            <button
              onClick={() => setDocumentModalOpen(true)}
              className="group inline-flex items-center gap-2 bg-white text-green-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-agritech-darkGreen">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ServiceCard
              title="Land Listing"
              description="List your agricultural land easily and connect with verified farmers"
              icon={<FileCheck className="w-7 h-7" />}
              actionLabel="Register Land"
              onAction={() => setDocumentModalOpen(true)}
            />
            <ServiceCard
              title="Secure Transactions"
              description="Safe and verified payment processing for all rentals"
              icon={<Check className="w-7 h-7" />}
            />
            <ServiceCard
              title="Browse Properties"
              description="24/7 customer support for all your needs"
              icon={<Search className="w-7 h-7" />}
              actionLabel="Browse Properties"
              onAction={() => navigate("/properties")}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-b from-white to-agritech-paleGreen/40 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-agritech-darkGreen">
                Built for Everyone in Agriculture
              </h2>
              <p className="text-gray-600 mt-3">
                Simple, transparent, and secure for both landowners and farmers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Landowners */}
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-agritech-paleGreen hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-100 rounded-full opacity-20 group-hover:scale-150 group-hover:opacity-30 transition-all duration-700" />

                <div className="relative">
                  <h3 className="text-2xl font-semibold mb-6 text-agritech-darkGreen flex items-center gap-2">
                    For Landowners
                  </h3>
                  <ul className="space-y-5">
                    {landownerFeatures.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Farmers */}
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-agritech-paleGreen hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-100 rounded-full opacity-20 group-hover:scale-150 group-hover:opacity-30 transition-all duration-700" />

                <div className="relative">
                  <h3 className="text-2xl font-semibold mb-6 text-agritech-darkGreen flex items-center gap-2">
                    For Farmers
                  </h3>
                  <ul className="space-y-5">
                    {farmerFeatures.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;