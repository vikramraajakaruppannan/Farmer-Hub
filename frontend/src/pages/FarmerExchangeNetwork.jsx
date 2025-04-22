import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';


export default function FarmerExchangeNetwork() {
  return (
    <div
      className="text-black min-h-screen px-6 py-10 space-y-10"
      style={{ backgroundColor: "#A6E483" }}
    >
      <Button
        variant="outline"
        className="absolute top-6 left-6"
        onClick={() => window.history.back()}
      >
        Back
      </Button>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Farmer Exchange Network</h2>
        <div className="w-24 h-1 mx-auto bg-green-500 rounded"></div>
      </div>

      {/* Intro Section */}
      <Card className="flex flex-col md:flex-row justify-between p-8 gap-6 shadow-lg">
        <div className="md:w-2/3 space-y-4">
          <h3 className="text-2xl font-semibold text-black">
            What is Farmer Exchange?
          </h3>
          <p className="text-black">
            A community platform where farmers help farmers. Share resources,
            exchange knowledge, and grow together. Connect with local farmers to
            share tools, seeds, and expertise.
          </p>
          <ul className="list-disc ml-6 text-black space-y-2">
            <li>Share or rent farming equipment</li>
            <li>Exchange seeds and organic inputs</li>
            <li>Learn from experienced farmers</li>
            <li>Build lasting farming relationships</li>
          </ul>
        </div>
        <img
  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx7DRPB-fWcQ1Hyc7mbOegMorhNb8m0PbYkae35Ec1FMQj5o4_SmdMc3DRVNkotugJO5Q&usqp=CAU"
  alt=""
  className="md:w-1/3 rounded-lg shadow-md object-cover"
/>
      </Card>

      {/* Benefits Section */}
      <Card className="p-8 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 text-black text-center">
          Benefits of Joining
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "Share Knowledge",
              description:
                "Learn and share farming expertise with local community",
            },
            {
              title: "Resource Sharing",
              description: "Access tools and equipment when you need them",
            },
            {
              title: "Community Network",
              description: "Connect with farmers in your local area",
            },
            {
              title: "Cost Savings",
              description: "Reduce expenses through sharing and exchange",
            },
          ].map((benefit, idx) => (
            <Card key={idx} className="text-black text-center p-6 shadow">
              <div className="text-3xl mb-3">📌</div>
              <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
              <p className="text-sm text-gray-700">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* How It Works Section */}
      <Card className="p-8 shadow-lg">
        <h3 className="text-2xl font-semibold mb-6 text-black text-center">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black text-center">
          {[
            {
              step: "1",
              title: "Create Profile",
              desc: "Add your farm details and what you want to exchange",
            },
            {
              step: "2",
              title: "Find Partners",
              desc: "Discover farmers with matching needs in your area",
            },
            {
              step: "3",
              title: "Start Exchanging",
              desc: "Connect and arrange exchanges with other farmers",
            },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl font-bold text-green-700">{item.step}</div>
              <h4 className="font-semibold text-lg">{item.title}</h4>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Call to Action Section */}
      <Card className="flex flex-col md:flex-row items-center justify-between p-8 shadow-lg">
        <p className="text-black text-center md:text-left text-lg font-medium mb-4 md:mb-0">
          From My Soil To Yours — Sharing Wisdom, Growing Together
        </p>
        <Link to="/login"><Button variant="default" className="px-6 py-2 bg-green-700 text-white hover:bg-green-600">
          Get Started Now
        </Button></Link>
      </Card>
    </div>
  );
}
