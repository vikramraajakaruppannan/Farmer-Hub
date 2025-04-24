import React from "react";
import FarmRequests from "@/components/FarmRequests";
import Sidebar from "@/components/Sidebar";

const Index1 = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <FarmRequests />
      </div>
    </div>
  );
};

export default Index1;
