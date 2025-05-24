import React from "react";
import Navbar from "@/components/investor/Navbar";
import BackNav from "@/components/investor/BackNav";
import Footer from "@/components/investor/Footer";

const InvestorDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-urban-green-50">
      <Navbar />
      <BackNav />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-urban-green-800 mb-6">Investor Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Properties</h2>
            <p className="text-gray-600">View and manage your registered properties</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Document Review</h2>
            <p className="text-gray-600">Review and manage property documents</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InvestorDashboard;