
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, Star, LogOut, Navigation } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { DeliveryMap } from './DeliveryMap';
import { DeliveryList } from './DeliveryList';

interface CourierDashboardProps {
  courierData: any;
  onLogout: () => void;
}

export const CourierDashboard: React.FC<CourierDashboardProps> = ({ courierData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'map'>('deliveries');
  const [deliveries, setDeliveries] = useState([
    {
      id: 'EDU1703847234',
      status: 'pickup',
      customerName: 'John Doe',
      customerPhone: '+256 701 123 456',
      pickupAddress: 'Kampala Mall, Kampala',
      deliveryAddress: 'Makerere University, Kampala',
      items: ['Educational Books', 'Stationery'],
      estimatedTime: '30 mins',
      distance: '5.2 km'
    },
    {
      id: 'EDU1703847235',
      status: 'in_transit',
      customerName: 'Sarah Johnson',
      customerPhone: '+256 701 234 567',
      pickupAddress: 'Tech Store, Kampala',
      deliveryAddress: 'Ntinda Complex, Kampala',
      items: ['Laptop', 'Mouse'],
      estimatedTime: '15 mins',
      distance: '2.8 km'
    }
  ]);

  const updateDeliveryStatus = (deliveryId: string, newStatus: string) => {
    setDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-200/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {courierData.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {courierData.name}
              </h1>
              <p className="text-gray-600">ID: {courierData.id}</p>
            </div>
          </div>
          
          <EdumallButton
            variant="ghost"
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </EdumallButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Package size={24} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-xl font-bold text-blue-600">{courierData.completedDeliveries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Star size={24} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-xl font-bold text-green-600">{courierData.rating}/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Clock size={24} className="text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-xl font-bold text-orange-600">{deliveries.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <MapPin size={24} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="text-xl font-bold text-purple-600">{courierData.vehicle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-gray-200/50">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
            activeTab === 'deliveries'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Package size={20} className="inline mr-2" />
          Deliveries
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
            activeTab === 'map'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Navigation size={20} className="inline mr-2" />
          Map View
        </button>
      </div>

      {/* Content */}
      {activeTab === 'deliveries' ? (
        <DeliveryList 
          deliveries={deliveries} 
          onUpdateStatus={updateDeliveryStatus}
        />
      ) : (
        <DeliveryMap deliveries={deliveries} />
      )}
    </div>
  );
};
