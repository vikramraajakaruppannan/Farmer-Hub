// pages/Invest.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';

const Invest = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold">Investor Dashboard</h1>
      <p>Welcome to the investment page!</p>
    </div>
  </div>
);

export default Invest;