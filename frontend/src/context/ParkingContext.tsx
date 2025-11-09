import React, { createContext, useState, useContext, useEffect } from 'react';
import { ParkingSlot, Reservation } from '../types';
import { useAuth } from './AuthContext';
import { parkingApi, reservationApi } from '../services/api';

interface ParkingContextType {
  parkingSlots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  userReservations: Reservation[];
  selectSlot: (slot: ParkingSlot | null) => void;
  createReservation: (slotId: string, startTime: string, endTime: string) => Promise<Reservation>;
  cancelReservation: (reservationId: string) => Promise<void>;
  updatePaymentStatus: (reservationId: string, status: 'completed' | 'pending' | 'failed') => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ParkingContext = createContext<ParkingContextType>({
  parkingSlots: [],
  selectedSlot: null,
  userReservations: [],
  selectSlot: () => {},
  createReservation: async () => ({ 
    id: '', 
    userId: '', 
    slotId: '', 
    startTime: '', 
    endTime: '', 
    status: 'pending', 
    totalPrice: 0, 
    paymentStatus: 'pending' 
  }),
  cancelReservation: async () => {},
  updatePaymentStatus: async () => {},
  isLoading: false,
  error: null,
});

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching parking slots...');
        // Fetch parking slots from API (no authentication required)
        const slots = await parkingApi.getAllSlots();
        console.log('Received parking slots:', slots);
        setParkingSlots(slots);
        
        // Fetch user reservations if user is logged in
        if (user && token) {
          console.log('Fetching user reservations...');
          const reservations = await reservationApi.getUserReservations(token);
          console.log('Received user reservations:', reservations);
          setUserReservations(reservations);
        }
      } catch (err) {
        console.error('Error loading parking data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load parking data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, token]);

  const selectSlot = (slot: ParkingSlot | null) => {
    setSelectedSlot(slot);
  };

  const createReservation = async (slotId: string, startTime: string, endTime: string): Promise<Reservation> => {
    if (!user || !token) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create reservation through API
      const newReservation = await reservationApi.createReservation(
        token,
        slotId,
        startTime,
        endTime
      );
      
      // Update local state
      setParkingSlots(prevSlots => 
        prevSlots.map(s => 
          s.id === slotId ? { ...s, isAvailable: false } : s
        )
      );
      
      setUserReservations(prev => [...prev, newReservation]);
      setSelectedSlot(null);
      
      return newReservation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string): Promise<void> => {
    if (!user || !token) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Cancel reservation through API
      const updatedReservation = await reservationApi.cancelReservation(token, reservationId);
      
      // Update local state
      const reservation = userReservations.find(r => r.id === reservationId);
      if (reservation) {
        setParkingSlots(prevSlots => 
          prevSlots.map(s => 
            s.id === reservation.slotId ? { ...s, isAvailable: true } : s
          )
        );
      }
      
      setUserReservations(prev => 
        prev.map(r => r.id === reservationId ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (reservationId: string, status: 'completed' | 'pending' | 'failed'): Promise<void> => {
    if (!user || !token) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update payment status through API
      await reservationApi.updatePaymentStatus(token, reservationId, status);
      
      // Update local state
      setUserReservations(prev => 
        prev.map(r => r.id === reservationId ? { ...r, paymentStatus: status } : r)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParkingContext.Provider
      value={{
        parkingSlots,
        selectedSlot,
        userReservations,
        selectSlot,
        createReservation,
        cancelReservation,
        updatePaymentStatus,
        isLoading,
        error,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);