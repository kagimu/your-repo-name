
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomCursor } from '@/components/CustomCursor';
import { Navbar } from '@/components/layout/Navbar';
import { CourierLogin } from '@/components/courier/CourierLogin';
import { CourierDashboard } from '@/components/courier/CourierDashboard';

const Courier = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courierData, setCourierData] = useState(null);

  const handleLogin = (data: any) => {
    setCourierData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCourierData(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!isLoggedIn ? (
            <CourierLogin onLogin={handleLogin} />
          ) : (
            <CourierDashboard courierData={courierData} onLogout={handleLogout} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Courier;
