import React from 'react';
import { Reservation } from '../../types';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, IndianRupee, CreditCard } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (reservationId: string) => void;
  onMakePayment: (reservation: Reservation) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onCancel, onMakePayment }) => {
  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Calculate duration
  const calculateDuration = () => {
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };
  
  // Check if reservation is active (current time is between start and end)
  const isActive = () => {
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    
    return startTime <= now && now <= endTime;
  };
  
  // Check if reservation is upcoming (start time is in the future)
  const isUpcoming = () => {
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    
    return startTime > now;
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (reservation.status === 'cancelled') {
      return (
        <div className="flex items-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs font-medium">
          <XCircle size={14} className="mr-1" />
          Cancelled
        </div>
      );
    }
    
    if (isActive()) {
      return (
        <div className="flex items-center rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
          <CheckCircle size={14} className="mr-1" />
          Active
        </div>
      );
    }
    
    if (isUpcoming()) {
      return (
        <div className="flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
          <Clock size={14} className="mr-1" />
          Upcoming
        </div>
      );
    }
    
    return (
      <div className="flex items-center rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium">
        <CheckCircle size={14} className="mr-1" />
        Completed
      </div>
    );
  };
  
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <h3 className="font-medium text-lg">Slot {reservation.slot?.section}-{reservation.slot?.number}</h3>
            <div className="ml-2">
              {getStatusBadge()}
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin size={16} className="mr-2" />
              <span>Floor {reservation.slot?.floor}, {reservation.slot?.type} spot</span>
            </div>
            
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>From: {formatDateTime(reservation.startTime)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock size={16} className="mr-2" />
              <span>Duration: {calculateDuration()}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold">₹{reservation.totalPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mb-3">
            Payment: {reservation.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
          </div>
          
          <div className="space-y-2">
            {(isUpcoming() && reservation.status !== 'cancelled') && (
              <>
                {reservation.paymentStatus !== 'completed' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => onMakePayment(reservation)}
                    className="w-full mb-2"
                  >
                    <CreditCard size={16} className="mr-1" />
                    Pay Now
                  </Button>
                )}
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onCancel(reservation.id)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReservationCard;