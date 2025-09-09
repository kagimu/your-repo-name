
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';

export const FilterSidebar: React.FC = () => {
  const [openSections, setOpenSections] = useState<string[]>(['category', 'price', 'rating']);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    category: [],
    price: [],
    rating: []
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleFilter = (section: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [section]: prev[section].includes(value)
        ? prev[section].filter(v => v !== value)
        : [...prev[section], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      category: [],
      price: [],
      rating: []
    });
  };

  const filterSections = [
    {
      id: 'category',
      title: 'Category',
      options: [
        { value: 'laboratory', label: 'Laboratory Equipment' },
        { value: 'it', label: 'IT Equipment' },
        { value: 'furniture', label: 'Furniture' },
        { value: 'books', label: 'Books & Materials' },
        { value: 'sports', label: 'Sports Equipment' }
      ]
    },
    {
      id: 'price',
      title: 'Price Range',
      options: [
        { value: '0-50000', label: 'Under 50,000 UGX' },
        { value: '50000-100000', label: '50,000 - 100,000 UGX' },
        { value: '100000-500000', label: '100,000 - 500,000 UGX' },
        { value: '500000-1000000', label: '500,000 - 1,000,000 UGX' },
        { value: '1000000+', label: 'Over 1,000,000 UGX' }
      ]
    },
    {
      id: 'rating',
      title: 'Rating',
      options: [
        { value: '4+', label: '4+ Stars' },
        { value: '3+', label: '3+ Stars' },
        { value: '2+', label: '2+ Stars' },
        { value: '1+', label: '1+ Stars' }
      ]
    }
  ];

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <EdumallButton 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="text-xs"
        >
          Clear All
        </EdumallButton>
      </div>

      <div className="space-y-6">
        {filterSections.map((section) => (
          <div key={section.id} className="border-b border-gray-100 pb-4 last:border-b-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-gray-900">{section.title}</span>
              {openSections.includes(section.id) ? (
                <ChevronUp size={20} className="text-gray-600" />
              ) : (
                <ChevronDown size={20} className="text-gray-600" />
              )}
            </button>

            {openSections.includes(section.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                {section.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters[section.id].includes(option.value)}
                      onChange={() => toggleFilter(section.id, option.value)}
                      className="w-4 h-4 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Filters */}
      {Object.values(selectedFilters).some(filters => filters.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([section, filters]) =>
              filters.map((filter) => (
                <div
                  key={`${section}-${filter}`}
                  className="flex items-center gap-1 bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs"
                >
                  <span>{filter}</span>
                  <button
                    onClick={() => toggleFilter(section, filter)}
                    className="hover:bg-teal-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
