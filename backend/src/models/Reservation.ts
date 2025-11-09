import mongoose from 'mongoose';

export interface IReservation extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  slot: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed';
}

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient querying of user's reservations
reservationSchema.index({ user: 1, startTime: -1 });

// Index for efficient querying of slot's reservations
reservationSchema.index({ slot: 1, startTime: 1, endTime: 1 });

export default mongoose.model<IReservation>('Reservation', reservationSchema); 