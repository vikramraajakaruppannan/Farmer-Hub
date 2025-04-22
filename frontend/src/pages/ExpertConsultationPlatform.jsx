import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Phone,
  Heart,
  GraduationCap,
  MapPin,
  BarChart2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpertConsultationPlatform() {
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
      <div className="flex justify-center">
        <h2 className="text-3xl font-bold text-center border-b-4 border-green-400 inline-block pb-2">
          Connecting Farmers with Agricultural Researchers
        </h2>
      </div>

      {/* Real-Time Collaboration Section */}
      <Card className="flex flex-col md:flex-row items-center bg-white text-black p-8 rounded-xl shadow-md gap-6">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold">
            From Fields to Labs: Real-Time Collaboration
          </h2>
          <p>
            India’s farmers face daily challenges — soil issues, pest
            outbreaks, unpredictable weather. On the other side, agricultural
            researchers often lack real-time field data to innovate effectively.
            This platform bridges that gap.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              Instant collaboration between farmers and experts
            </li>
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              Real-time data sharing and analysis
            </li>
            <li className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" />
              Mutual growth and innovation
            </li>
          </ul>
        </div>
        <img
          src="https://th.bing.com/th/id/OIP._kkHMf-uIJJc0SjM-H3hUAHaFL?rs=1&pid=ImgDetMain"
          alt="Farmer"
          className="w-full md:w-1/3 rounded-lg shadow-md object-cover"
        />
      </Card>

      {/* How It Works */}
      <Card className="bg-white text-black p-8 rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          How It Works – Platform Flow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            [
              "Farmer Posts Query",
              "Upload images or videos of crop issues for instant expert review",
            ],
            [
              "Expert Gets Notified",
              "Verified agricultural experts provide immediate guidance",
            ],
            [
              "Live Collaboration",
              "Real-time interaction and solution implementation",
            ],
            [
              "Data Analysis",
              "Pattern detection and research insights generation",
            ],
          ].map(([title, desc], index) => (
            <Card
              key={index}
              className="bg-gray-100 p-6 text-black rounded-lg text-center hover:shadow-md transition duration-300"
            >
              <h3 className="text-xl font-bold text-green-800 mb-2">
                {index + 1}
              </h3>
              <p className="font-semibold">{title}</p>
              <p className="text-sm mt-1">{desc}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white text-black p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Farmer Benefits</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Phone className="mr-2 text-green-800" /> 24/7 Expert Access
            </li>
            <li className="flex items-center">
              <Heart className="mr-2 text-green-800" /> Personalized Solutions
            </li>
            <li className="flex items-center">
              <GraduationCap className="mr-2 text-green-800" /> Knowledge
              Growth
            </li>
          </ul>
        </Card>

        <Card className="bg-white text-black p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Researcher Benefits</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <MapPin className="mr-2 text-green-800" /> Real-time Field Data
            </li>
            <li className="flex items-center">
              <BarChart2 className="mr-2 text-green-800" /> Trend Analysis
            </li>
            <li className="flex items-center">
              <Search className="mr-2 text-green-800" /> Research Opportunities
            </li>
          </ul>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-white text-black p-8 rounded-xl shadow-md text-center space-y-4">
        <h2 className="text-2xl font-semibold">Ready to Try It Out?</h2>
        <p className="text-md">When science meets soil — magic grows.</p>
        <Link to="/login"><Button className="bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all">
          Get Started Now
        </Button></Link>
      </Card>
    </div>
  );
}
