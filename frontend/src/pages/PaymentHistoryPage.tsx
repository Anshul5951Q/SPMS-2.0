import React from 'react';
import { useParking } from '../context/ParkingContext';
import Card from '../components/ui/Card';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';

const PaymentHistoryPage: React.FC = () => {
  const { userReservations } = useParking();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const sortedReservations = [...userReservations]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      <div className="space-y-4">
        {sortedReservations.map(reservation => (
          <Card key={reservation.id}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <MapPin size={16} className="text-gray-500 mr-2" />
                  <span className="font-medium">
                    Slot {reservation.slot?.section}-{reservation.slot?.number}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    <span>{formatDate(reservation.startTime)}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock size={14} className="mr-2" />
                    <span>
                      {new Date(reservation.startTime).toLocaleTimeString()} - 
                      {new Date(reservation.endTime).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CreditCard size={14} className="mr-2" />
                    <span>Payment ID: {reservation.id}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold">₹{reservation.totalPrice}</div>
                <div className={`text-sm ${
                  reservation.status === 'cancelled' 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {reservation.status === 'cancelled' ? 'Cancelled' : 'Paid'}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {sortedReservations.length === 0 && (
          <Card>
            <div className="text-center py-6 text-gray-500">
              <CreditCard size={40} className="mx-auto mb-2 opacity-50" />
              <p>No payment history available</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;