import React from 'react';
import { Filter, CheckSquare, Layers, Grid, Car } from 'lucide-react';

interface ParkingFiltersProps {
  filter: {
    floor: number | null;
    section: string | null;
    type: string | null;
    availableOnly: boolean;
  };
  onFilterChange: (key: string, value: any) => void;
  floorOptions: number[];
  sectionOptions: string[];
  typeOptions: string[];
}

const ParkingFilters: React.FC<ParkingFiltersProps> = ({
  filter,
  onFilterChange,
  floorOptions,
  sectionOptions,
  typeOptions,
}) => {
  // Function to reset all filters
  const resetFilters = () => {
    onFilterChange('floor', null);
    onFilterChange('section', null);
    onFilterChange('type', null);
    onFilterChange('availableOnly', true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <Filter size={18} className="mr-2" />
          Filters
        </h3>
        <button 
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={resetFilters}
        >
          Reset All
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Floor Filter */}
        <div>
          <div className="flex items-center mb-2 text-sm font-medium text-gray-700">
            <Layers size={16} className="mr-1" />
            Floor
          </div>
          <div className="flex flex-wrap gap-2">
            {floorOptions.map(floor => (
              <button
                key={floor}
                className={`px-3 py-1 rounded-full text-sm border ${
                  filter.floor === floor
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('floor', filter.floor === floor ? null : floor)}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>
        
        {/* Section Filter */}
        <div>
          <div className="flex items-center mb-2 text-sm font-medium text-gray-700">
            <Grid size={16} className="mr-1" />
            Section
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionOptions.map(section => (
              <button
                key={section}
                className={`px-3 py-1 rounded-full text-sm border ${
                  filter.section === section
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('section', filter.section === section ? null : section)}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
        
        {/* Type Filter */}
        <div>
          <div className="flex items-center mb-2 text-sm font-medium text-gray-700">
            <Car size={16} className="mr-1" />
            Spot Type
          </div>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(type => (
              <button
                key={type}
                className={`px-3 py-1 rounded-full text-sm border ${
                  filter.type === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onFilterChange('type', filter.type === type ? null : type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Available Only Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <CheckSquare size={16} className="mr-1" />
            Show available only
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="availableOnly"
              name="availableOnly"
              checked={filter.availableOnly}
              onChange={(e) => onFilterChange('availableOnly', e.target.checked)}
              className="sr-only peer"
            />
            <label
              htmlFor="availableOnly"
              className="flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-300 p-1 peer-checked:bg-blue-600 peer-focus:outline-none"
            >
              <div className="h-4 w-4 rounded-full bg-white transition-all duration-300 ease-in-out peer-checked:translate-x-5" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingFilters;