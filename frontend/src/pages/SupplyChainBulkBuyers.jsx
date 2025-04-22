import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Truck,
  CreditCard,
  ClipboardList,
  BarChart3,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SupplyChainBulkBuyers() {
  return (
    <div
      className="text-black min-h-screen px-6 md:px-16 py-10 space-y-14"
      style={{ backgroundColor: "#A6E483" }}
    >
      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-6 md:absolute md:top-6 md:left-6"
        onClick={() => window.history.back()}
      >
        Back
      </Button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Supply Chain for Bulk Buyers
      </h1>

      {/* Smarter Supply Chain Section */}
      <Card className="flex flex-col md:flex-row items-center bg-white text-black p-8 rounded-xl shadow-md gap-6">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold">
            From Farm to Freight: A Smarter Supply Chain
          </h2>
          <p>
            Creating a transparent, data-driven supply chain where bulk buyers
            can source directly from verified farmers or producer groups —
            cutting costs, reducing delays, and ensuring quality.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" /> Direct procurement
              from verified farmers
            </li>
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" /> Integrated
              logistics and tracking
            </li>
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" /> Quality assurance
              and analytics
            </li>
          </ul>
        </div>
        <img
          src="https://media.istockphoto.com/id/532865778/photo/hands-holding-a-grate-full-of-fresh-vegetables.jpg?s=1024x1024&w=is&k=20&c=BXi3veDAUjI4DkabsGqs5Cal7PnDPL59Dz1YBOf5kfg="
          alt="Hands holding a crate full of fresh vegetables from the farm"
          className="w-full md:w-1/3 rounded-lg shadow-lg object-cover"
        />
      </Card>

      {/* Platform Flow */}
      <Card className="bg-white text-black p-8 rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          How It Works – Platform Flow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "1. Post Requirement",
              desc: "Specify quantity, quality, and timeline needs",
            },
            {
              title: "2. Farmer Confirms",
              desc: "Get matched with verified suppliers",
            },
            {
              title: "3. Logistics Setup",
              desc: "Automated transport and tracking",
            },
            {
              title: "4. Quality & Payment",
              desc: "Secure transactions and feedback",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="bg-gray-100 p-6 text-black rounded-lg text-center hover:shadow-lg transition duration-300"
            >
              <h3 className="text-lg font-bold text-green-800 mb-2">
                {item.title}
              </h3>
              <p className="text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white text-black p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bulk Buyer Benefits</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" /> Direct Procurement
            </li>
            <li className="flex items-center">
              <Truck className="text-yellow-600 mr-2" /> Reliable Delivery
            </li>
            <li className="flex items-center">
              <BarChart3 className="text-blue-600 mr-2" /> Quality Assurance
            </li>
          </ul>
        </Card>

        <Card className="bg-white text-black p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Farmer Benefits</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Globe className="text-pink-600 mr-2" /> Access to Big Markets
            </li>
            <li className="flex items-center">
              <CreditCard className="text-yellow-600 mr-2" /> Better Price
              Realization
            </li>
            <li className="flex items-center">
              <ClipboardList className="text-orange-600 mr-2" /> Logistics
              Support
            </li>
          </ul>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-white text-black p-8 rounded-xl shadow-md text-center space-y-4">
        <h2 className="text-2xl font-semibold">Ready to Try It Out?</h2>
        <p className="text-md">
          From concrete to crops — your investment, their harvest
        </p>
        <Link to="/login"><Button className="bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all">
          Get Started Now
        </Button></Link>
      </Card>
    </div>
  );
}
