import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, Clock, CreditCard, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ReservationCard from '../components/reservations/ReservationCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { parkingSlots, userReservations, cancelReservation } = useParking();
  const navigate = useNavigate();
  
  // Get count of available parking slots
  const availableSlotsCount = parkingSlots.filter(slot => slot.isAvailable).length;
  
  // Get active reservations (not cancelled and current time is between start and end)
  const activeReservations = userReservations.filter(reservation => {
    if (reservation.status === 'cancelled') return false;
    
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const endTime = new Date(reservation.endTime);
    
    return startTime <= now && now <= endTime;
  });
  
  // Get upcoming reservations (not cancelled and start time is in the future)
  const upcomingReservations = userReservations.filter(reservation => {
    if (reservation.status === 'cancelled') return false;
    
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    
    return startTime > now;
  });
  
  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId);
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          variant="primary"
          onClick={() => navigate('/parking')}
          rightIcon={<Car size={18} />}
        >
          Find Parking
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <Car size={24} />
            </div>
            <div className="ml-3">
              <div className="text-sm opacity-80">Available Spots</div>
              <div className="text-2xl font-bold">{availableSlotsCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-teal-500 to-teal-700 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <Calendar size={24} />
            </div>
            <div className="ml-3">
              <div className="text-sm opacity-80">Active Reservations</div>
              <div className="text-2xl font-bold">{activeReservations.length}</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <Clock size={24} />
            </div>
            <div className="ml-3">
              <div className="text-sm opacity-80">Upcoming</div>
              <div className="text-2xl font-bold">{upcomingReservations.length}</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-30 rounded-lg">
              <CreditCard size={24} />
            </div>
            <div className="ml-3">
              <div className="text-sm opacity-80">Total Spent</div>
              <div className="text-2xl font-bold">
                ₹{userReservations
                  .reduce((total, res) => total + (res.status !== 'cancelled' ? res.totalPrice : 0), 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Reservations</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/reservations')}
          >
            View All
          </Button>
        </div>
        
        {activeReservations.length === 0 ? (
          <Card className="text-center py-6">
            <p className="text-gray-500">No active reservations</p>
            <Button 
              variant="primary" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/parking')}
            >
              Find Parking
            </Button>
          </Card>
        ) : (
          <div>
            {activeReservations.slice(0, 2).map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancelReservation}
              />
            ))}
          </div>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Reservations</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/reservations')}
          >
            View All
          </Button>
        </div>
        
        {upcomingReservations.length === 0 ? (
          <Card className="text-center py-6">
            <p className="text-gray-500">No upcoming reservations</p>
            <Button 
              variant="primary" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/parking')}
            >
              Book Parking
            </Button>
          </Card>
        ) : (
          <div>
            {upcomingReservations.slice(0, 2).map(reservation => (
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
  );
};

export default DashboardPage;