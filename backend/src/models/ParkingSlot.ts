import mongoose from 'mongoose';

export interface IParkingSlot extends mongoose.Document {
  section: string;
  number: number;
  floor: number;
  type: 'standard' | 'handicap' | 'electric';
  isAvailable: boolean;
  price: number;
}

const parkingSlotSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['standard', 'handicap', 'electric']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: true,
    default: 50 // Default price in Indian Rupees
  }
}, {
  timestamps: true
});

// Compound index for unique slot identification
parkingSlotSchema.index({ section: 1, number: 1, floor: 1 }, { unique: true });

export default mongoose.model<IParkingSlot>('ParkingSlot', parkingSlotSchema); 