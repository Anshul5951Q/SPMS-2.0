import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';
import Card from '../components/ui/Card';
import { User, Car, Calendar, CreditCard } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { userReservations } = useParking();

  const totalSpent = userReservations
    .filter(res => res.status !== 'cancelled')
    .reduce((total, res) => total + res.totalPrice, 0);

  const activeReservations = userReservations.filter(res => res.status === 'confirmed');
  const completedReservations = userReservations.filter(res => res.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={40} className="text-blue-600" />
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center">
              <Car size={24} className="text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Active Reservations</p>
                <p className="text-xl font-bold">{activeReservations.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <Calendar size={24} className="text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completed Bookings</p>
                <p className="text-xl font-bold">{completedReservations.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <CreditCard size={24} className="text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold">₹{totalSpent}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="font-medium">January 2025</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Status</p>
            <p className="font-medium text-green-600">Active</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Preferred Payment Method</p>
            <p className="font-medium">Credit Card (**** 1234)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;