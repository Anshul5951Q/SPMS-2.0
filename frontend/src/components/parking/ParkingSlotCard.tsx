import React from 'react';
import { ParkingSlot } from '../../types';
import Card from '../ui/Card';
import { Car, Zap, MinusCircle, IndianRupee } from 'lucide-react';

interface ParkingSlotCardProps {
  slot: ParkingSlot;
  selected: boolean;
  onClick: () => void;
}

const ParkingSlotCard: React.FC<ParkingSlotCardProps> = ({ slot, selected, onClick }) => {
  // Get appropriate icon based on slot type
  const getSlotIcon = () => {
    switch (slot.type) {
      case 'handicap':
        return <MinusCircle size={18} className="text-blue-600" />;
      case 'electric':
        return <Zap size={18} className="text-yellow-500" />;
      case 'standard':
      default:
        return <Car size={18} className="text-gray-600" />;
    }
  };
  
  // Get style classes based on availability
  const getAvailabilityClasses = () => {
    if (!slot.isAvailable) {
      return 'bg-gray-100 opacity-60';
    }
    return '';
  };
  
  return (
    <Card
      hover={slot.isAvailable}
      selected={selected}
      onClick={slot.isAvailable ? onClick : undefined}
      className={`${getAvailabilityClasses()} transition-all duration-200 transform hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-1">
            {getSlotIcon()}
            <span className="ml-1 font-medium">{slot.section}-{slot.number}</span>
          </div>
          <p className="text-sm text-gray-600">Floor {slot.floor}</p>
          <div className="flex items-center mt-2 text-sm">
            <IndianRupee size={16} className="text-gray-700" />
            <span className="font-medium">₹{slot.price}/hour</span>
          </div>
        </div>
        
        <div className={`flex items-center justify-center rounded-full w-8 h-8 ${
          slot.isAvailable 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          <span className="text-xs font-medium">
            {slot.isAvailable ? 'A' : 'U'}
          </span>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-xs uppercase text-gray-500">
          {slot.type} spot
        </div>
      </div>
    </Card>
  );
};

export default ParkingSlotCard;