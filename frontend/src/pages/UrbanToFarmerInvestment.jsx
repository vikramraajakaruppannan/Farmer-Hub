import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  BarChart3,
  ShieldCheck,
  Handshake,
  Globe,
  PieChart,
} from "lucide-react";
import {Link} from "react-router-dom";

export default function UrbanToFarmerInvestment() {
  return (
    <div className="text-black min-h-screen px-4 sm:px-8 py-10" style={{ backgroundColor: "#A6E483" }}>
      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-6 absolute top-6 left-6"
        onClick={() => window.history.back()}
      >
        Back
      </Button>

      {/* Page Title */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold">Urban to Farmer Investment</h1>
      </div>

      {/* What Is Urban to Farmer Investment? */}
      <Card className="flex flex-col md:flex-row items-center bg-white text-black p-8 gap-8 max-w-5xl mx-auto mb-10">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold">What Is Urban to Farmer Investment?</h2>
          <p>
            It’s a simple way for urban citizens to invest in real-world farming projects. You invest in verified, transparent farming projects, and earn profits while helping India’s farmers grow.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              Combines social impact + financial return
            </li>
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              Real-time updates on crops
            </li>
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              Safe, diversified investments
            </li>
          </ul>
        </div>
        <img
          src="https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?w=600&auto=format&fit=crop&q=60"
          alt="Farming"
          className="w-full md:w-1/3 rounded-lg shadow-md"
        />
      </Card>

      {/* How It Works */}
      <Card className="bg-white text-black p-8 max-w-5xl mx-auto mb-10">
        <h2 className="text-2xl font-semibold mb-6">How It Works – The Flow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <Card className="bg-gray-100 p-6 text-black h-full">
            <h3 className="text-xl font-bold text-green-800">1. Browse Projects</h3>
            <p className="mt-2 text-sm">
              Explore verified farm projects with detailed info about crop type, location, and returns.
            </p>
            <div className="mt-4 p-3 bg-white rounded shadow text-sm">
              <p className="font-medium">🌾 Organic Millet Farm</p>
              <p>Karnataka • 12% ROI • 10 months</p>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="bg-gray-100 p-6 text-black h-full">
            <h3 className="text-xl font-bold text-green-800">2. Meet the Farmer</h3>
            <img
              src="https://images.unsplash.com/photo-1570129477492-45c003edd2be"
              alt="Farmer"
              className="rounded-lg mt-3"
            />
            <p className="mt-3 text-sm italic">
              “I’ve been growing turmeric naturally for 12 years. Your support helps me expand.”<br />– Gowtham, Tamil Nadu
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="bg-gray-100 p-6 text-black h-full">
            <h3 className="text-xl font-bold text-green-800">3. Invest & Track</h3>
            <div className="flex justify-center gap-4 my-4">
              <h2 className="bg-white text-black px-4 py-2 rounded shadow">Rent</h2>
              <h2 className="bg-white text-black px-4 py-2 rounded shadow">Help farmers</h2>
            </div>
            <div className="text-sm">
              <p className="font-semibold">Project Timeline</p>
              <p>🌱 Sowing → 🌿 Growth → 🌾 Harvest</p>
            </div>
          </Card>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="bg-white text-black p-8 max-w-5xl mx-auto mb-10">
        <h2 className="text-2xl font-semibold mb-6">Benefits of Investing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="flex items-center"><BarChart3 className="mr-2 text-yellow-600" /> <strong>Attractive Returns</strong></p>
            <p className="text-sm ml-6">Average ROI between 10%–15% annually</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center"><ShieldCheck className="mr-2 text-yellow-600" /> <strong>Secure Investment</strong></p>
            <p className="text-sm ml-6">Verified projects with insurance coverage</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center"><Handshake className="mr-2 text-blue-600" /> <strong>Social Impact</strong></p>
            <p className="text-sm ml-6">Support sustainable farming practices</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center"><PieChart className="mr-2 text-blue-600" /> <strong>Easy Management</strong></p>
            <p className="text-sm ml-6">Track and manage investments online</p>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <Card className="bg-white text-black p-8 text-center max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-semibold mb-2">Ready to Try It Out?</h2>
        <p className="mb-4">From concrete to crops — your investment, their harvest</p>
        <Link to="/login"><Button className="bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-700">
          Get Started Now
        </Button></Link>
      </Card>
    </div>
  );
}
