import React, { useState } from 'react';
import { ParkingSlot } from '../../types';
import ParkingSlotCard from './ParkingSlotCard';

interface ParkingGridProps {
  slots: ParkingSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  filter: {
    floor: number | null;
    section: string | null;
    type: string | null;
    availableOnly: boolean;
  };
}

const ParkingGrid: React.FC<ParkingGridProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  filter,
}) => {
  // Filter slots based on criteria
  const filteredSlots = slots.filter(slot => {
    // Filter by floor
    if (filter.floor !== null && slot.floor !== filter.floor) {
      return false;
    }
    
    // Filter by section
    if (filter.section !== null && slot.section !== filter.section) {
      return false;
    }
    
    // Filter by type
    if (filter.type !== null && slot.type !== filter.type) {
      return false;
    }
    
    // Filter by availability
    if (filter.availableOnly && !slot.isAvailable) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="mt-4">
      {filteredSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-500 text-center">
            <p className="text-lg font-medium">No parking slots match your criteria</p>
            <p className="mt-2">Try adjusting your filters to see more options</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map(slot => (
            <ParkingSlotCard
              key={slot.id}
              slot={slot}
              selected={slot.id === selectedSlotId}
              onClick={() => onSelectSlot(slot)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParkingGrid;