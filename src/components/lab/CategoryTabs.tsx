import { Beaker, Microscope, TestTubes } from 'lucide-react';
import { LabItemCategory } from '@/types/lab';

interface CategoryTabsProps {
  activeCategory: LabItemCategory | 'all';
  onCategoryChange: (category: LabItemCategory | 'all') => void;
  categoryCounts: {
    all: number;
    specimen: number;
    chemical: number;
    apparatus: number;
  };
}

export const CategoryTabs = ({ activeCategory, onCategoryChange, categoryCounts }: CategoryTabsProps) => {
  const categories = [
    { id: 'all', label: 'All Items', icon: Beaker, count: categoryCounts.all },
    { id: 'specimen', label: 'Specimens', icon: Microscope, count: categoryCounts.specimen },
    { id: 'chemical', label: 'Chemicals', icon: TestTubes, count: categoryCounts.chemical },
    { id: 'apparatus', label: 'Apparatus', icon: Beaker, count: categoryCounts.apparatus }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as LabItemCategory | 'all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-teal-100 text-teal-800 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-selected={activeCategory === category.id}
            role="tab"
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              activeCategory === category.id
                ? 'bg-teal-200 text-teal-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
