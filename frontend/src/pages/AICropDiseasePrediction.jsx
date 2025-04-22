import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export default function AICropDiseasePrediction() {
  return (
    <div
      className="text-balck min-h-screen px-6 py-10"
      style={{ backgroundColor: '#A6E483' }}
    >
      <Button
        variant="outline"
        className="mb-4 absolute top-6 left-6"
        onClick={() => window.history.back()}
      >
        Back
      </Button>

      <div className="flex justify-center">
        <h2 className="text-2xl font-bold mb-6 border-b-4">
          AI-Based Crop Disease Prediction
        </h2>
      </div>

      {/* Intro Section */}
      <Card className="flex flex-col md:flex-row justify-between p-6 mb-10">
        <div className="md:w-2/3">
          <h3 className="text-xl font-semibold mb-2 text-black">
            What is AI Crop Disease Prediction?
          </h3>
          <p className="text-black mb-4">
          Our advanced AI system leverages deep learning algorithms trained on thousands of plant images to accurately detect crop diseases at scale. By analyzing subtle visual cues often invisible to the naked eye, it provides real-time insights, including disease identification, confidence scores, and actionable treatment recommendations—all within seconds. Constantly learning and evolving, the model adapts to new patterns, environments, and crop types, ensuring up-to-date accuracy. Whether you're a smallholder or managing extensive farmland, the tool is easy to use—just upload a photo and let the AI do the work. Early detection means farmers can take quick, informed action, reducing crop loss, boosting yields, and protecting livelihoods.
</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1692861615303-966d22897154?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFncmljdWx0dXJlJTIwYWklMjBjcm9wJTIwcHJlZGljdGlvbnN8ZW58MHx8MHx8fDA%3D"
          alt="Crop with Mobile"
          className="md:w-1/3 mt-4 md:mt-0 rounded-md"
        />
      </Card>

      {/* How It Works Section */}
      <Card className="p-6 mb-10">
        <h3 className="text-xl font-semibold mb-4 text-black">How It Works</h3>
        <ul className="text-black space-y-4">
          <li>
            <strong>1. Upload Your Image</strong>
            <br />
            Take a clear photo of the affected plant leaf or upload an existing image. Ensure good lighting and focus for best results.
          </li>
          <li>
            <strong>2. AI Analysis</strong>
            <br />
            Our AI model processes the image, analyzing patterns and symptoms to identify potential diseases.
          </li>
          <li>
            <strong>3. Get Results</strong>
            <br />
            Receive detailed analysis including disease identification, confidence score, and treatment recommendations.
          </li>
        </ul>
      </Card>

      {/* Supported Crops Section */}
      <Card className="p-6 mb-10">
        <h3 className="text-xl font-semibold mb-4 text-black">Supported Crops & Diseases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              name: "Tomato",
              diseases: "Early Blight, Late Blight, Leaf Spot",
              img: "https://www.thespruce.com/thmb/jSfcjgZnC9URQHL_KWkgtDLowrY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/spruce-tomatoblight-NataliaKokhanova-67e618952a154ee8a0b0f24f190cdb14.jpg",
            },
            {
              name: "Potato",
              diseases: "Late Blight, Black Scarf, Common Scab",
              img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFTq1r3OTY7MzDuBpRpGNkucH4MJz8qJ-vKw&s",
            },
            {
              name: "Corn",
              diseases: "Common Rust, Northern Leaf Blight",
              img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4LmLKNVNyv89_3qhqnj6VEFjkWSZ2b_Iuag&s",
            },
            {
              name: "Cotton",
              diseases: "Bacterial Blight, Verticillium Wilt",
              img: "https://files.worldwildlife.org/wwfcmsprod/images/Cotton_09.21.12_Industries/hero_small/74bop80spn_133837741.jpg",
            },
          ].map((crop) => (
            <Card key={crop.name} className="text-black">
              <img
                src={crop.img || "https://via.placeholder.com/150"}
                alt={crop.name}
                className="w-full h-32 object-cover"
              />
              <CardContent>
                <h4 className="font-semibold mt-2">{crop.name}</h4>
                <p className="text-sm text-gray-700">{crop.diseases}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>

      {/* Call to Action Section */}
      <Card className="flex items-center justify-between p-6">
        <p className="text-black">
          Start protecting your crops with AI-powered disease detection.
        </p>
        <Link to="/login">
          <Button variant="default">Get Started Now</Button>
        </Link>
      </Card>

    </div>
  );
}
