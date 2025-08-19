import React from 'react';
import { BookOpen, Search, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'learn', label: 'Smart Learning', icon: BookOpen },
    { id: 'research', label: 'Research Hub', icon: Search },
    { id: 'tools', label: 'Study Tools', icon: Lightbulb },
    { id: 'practice', label: 'Practice Zone', icon: Target },
    { id: 'progress', label: 'My Progress', icon: TrendingUp }
  ];

  return (
    <div className="relative mb-8">
      {/* Fade edges on mobile */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden" />
      
      {/* Scrollable container */}
      <div className="overflow-x-auto no-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
        <div className="flex w-max md:w-full gap-1 bg-white/80 backdrop-blur-lg rounded-xl p-1.5 border border-gray-200/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-none w-[110px] sm:w-[130px] md:w-auto md:flex-1
                  py-2 px-2 md:px-4 rounded-lg transition-all duration-300
                  font-medium flex items-center justify-center gap-1.5
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
