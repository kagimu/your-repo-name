import { Search, SortAsc, SortDesc } from 'lucide-react';
import { LabFilter } from '@/types/lab';

interface FilterBarProps {
  filter: LabFilter;
  onFilterChange: (filter: Partial<LabFilter>) => void;
}

export const FilterBar = ({ filter, onFilterChange }: FilterBarProps) => {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'lastUpdated', label: 'Last Updated' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={filter.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search by name, ID, or location..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          aria-label="Search inventory"
        />
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        <select
          value={filter.sortBy}
          onChange={(e) => onFilterChange({ 
            sortBy: e.target.value as LabFilter['sortBy']
          })}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          aria-label="Sort by"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => onFilterChange({ 
            sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          aria-label={`Sort ${filter.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {filter.sortOrder === 'asc' ? (
            <SortAsc className="w-5 h-5 text-gray-600" />
          ) : (
            <SortDesc className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};
