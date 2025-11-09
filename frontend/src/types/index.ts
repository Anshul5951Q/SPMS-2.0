export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ParkingSlot {
  id: string;
  floor: number;
  section: string;
  number: number;
  type: 'standard' | 'handicap' | 'electric';
  isAvailable: boolean;
  price: number;
}

export interface Reservation {
  id: string;
  userId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'completed';
  slot?: ParkingSlot;
}

export interface PaymentInfo {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvv: string;
}