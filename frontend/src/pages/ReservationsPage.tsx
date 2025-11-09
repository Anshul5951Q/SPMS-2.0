import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Reservation } from '../types';
import ReservationCard from '../components/reservations/ReservationCard';
import Button from '../components/ui/Button';
import { MessageCircle, Calendar, CheckCircle, XCircle, History } from 'lucide-react';
import Modal from '../components/ui/Modal';

const ReservationsPage: React.FC = () => {
  const { userReservations, cancelReservation, isLoading } = useParking();
  
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past' | 'all'>('current');
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  // Filter reservations based on active tab
  const filteredReservations = userReservations.filter(reservation => {
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    
    if (activeTab === 'all') return true;
    
    if (activeTab === 'upcoming') {
      return reservation.status !== 'cancelled' && startTime > now;
    }
    
    if (activeTab === 'current') {
      return reservation.status !== 'cancelled' && startTime <= now && now <= endTime;
    }
    
    if (activeTab === 'past') {
      return now > endTime || reservation.status === 'cancelled';
    }
    
    return true;
  });
  
  // Handle tab change
  const handleTabChange = (tab: 'current' | 'upcoming' | 'past' | 'all') => {
    setActiveTab(tab);
  };
  
  // Handle cancel reservation
  const handleCancelReservation = (reservationId: string) => {
    setConfirmCancelId(reservationId);
  };
  
  // Confirm cancellation
  const confirmCancellation = async () => {
    if (!confirmCancelId) return;
    
    try {
      await cancelReservation(confirmCancelId);
      setConfirmCancelId(null);
      setCancelSuccess(true);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };
  
  const tabButtonClass = (tab: string) => `px-4 py-2 text-sm font-medium ${
    activeTab === tab 
      ? 'text-blue-600 border-b-2 border-blue-600' 
      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
  }`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button 
              className={tabButtonClass('current')}
              onClick={() => handleTabChange('current')}
            >
              <CheckCircle size={16} className="inline-block mr-1" />
              Active
            </button>
            <button 
              className={tabButtonClass('upcoming')}
              onClick={() => handleTabChange('upcoming')}
            >
              <Calendar size={16} className="inline-block mr-1" />
              Upcoming
            </button>
            <button 
              className={tabButtonClass('past')}
              onClick={() => handleTabChange('past')}
            >
              <History size={16} className="inline-block mr-1" />
              Past
            </button>
            <button 
              className={tabButtonClass('all')}
              onClick={() => handleTabChange('all')}
            >
              All
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No {activeTab} reservations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map(reservation => (
                <ReservationCard 
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancelReservation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmCancelId}
        onClose={() => setConfirmCancelId(null)}
        title="Cancel Reservation"
        size="sm"
      >
        <div className="p-2">
          <p className="mb-4">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setConfirmCancelId(null)}
              fullWidth
            >
              Keep Reservation
            </Button>
            
            <Button
              variant="danger"
              onClick={confirmCancellation}
              isLoading={isLoading}
              fullWidth
            >
              Cancel Reservation
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        isOpen={cancelSuccess}
        onClose={() => setCancelSuccess(false)}
        title="Reservation Cancelled"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <XCircle size={32} className="text-green-600" />
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reservation Successfully Cancelled</h3>
          <p className="text-gray-600 mb-4">Your reservation has been cancelled and your spot is now available for others.</p>
          
          <Button
            variant="primary"
            onClick={() => setCancelSuccess(false)}
            fullWidth
          >
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ReservationsPage;