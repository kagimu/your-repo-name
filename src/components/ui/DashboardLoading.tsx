import React from 'react';
import { Navbar } from '@/components/layout/Navbar';

interface DashboardLoadingProps {
  isLoading: boolean;
  error: string | null;
}

export const DashboardLoading: React.FC<DashboardLoadingProps> = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return null;
};
