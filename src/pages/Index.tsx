
import React from 'react';
import { CustomCursor } from '@/components/CustomCursor';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        {/* More sections will be added in subsequent phases */}
      </main>
    </div>
  );
};

export default Index;
