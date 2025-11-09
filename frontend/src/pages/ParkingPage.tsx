import React, { useState } from 'react';
import { Calendar, Clock, CalendarClock, CreditCard, Info, IndianRupee } from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { PaymentInfo, ParkingSlot, Reservation } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ParkingFilters from '../components/parking/ParkingFilters';
import ParkingGrid from '../components/parking/ParkingGrid';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import PaymentForm from '../components/payment/PaymentForm';

const ParkingPage: React.FC = () => {
  const { parkingSlots, selectedSlot, selectSlot, createReservation, isLoading } = useParking();
  
  // Filter state
  const [filter, setFilter] = useState({
    floor: null as number | null,
    section: null as string | null,
    type: null as string | null,
    availableOnly: true,
  });
  
  // Reservation state
  const [reservationDetails, setReservationDetails] = useState({
    startDate: '',
    startTime: '',
    duration: '1', // Hours
  });
  
  const [reservationErrors, setReservationErrors] = useState({
    startDate: '',
    startTime: '',
    duration: '',
  });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationSuccessModal, setReservationSuccessModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  
  // Get all available floors, sections, and types for filters
  const floorOptions = Array.from(new Set(parkingSlots.map(slot => slot.floor))).sort();
  const sectionOptions = Array.from(new Set(parkingSlots.map(slot => slot.section))).sort();
  const typeOptions = Array.from(new Set(parkingSlots.map(slot => slot.type))).sort();
  
  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Handle slot selection
  const handleSelectSlot = (slot: ParkingSlot) => {
    selectSlot(slot);
  };
  
  // Handle reservation form change
  const handleReservationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReservationDetails(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (reservationErrors[name as keyof typeof reservationErrors]) {
      setReservationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Validate reservation form
  const validateReservation = () => {
    const errors = {
      startDate: '',
      startTime: '',
      duration: '',
    };
    let isValid = true;
    
    if (!reservationDetails.startDate) {
      errors.startDate = 'Date is required';
      isValid = false;
    }
    
    if (!reservationDetails.startTime) {
      errors.startTime = 'Time is required';
      isValid = false;
    }
    
    if (!reservationDetails.duration || parseInt(reservationDetails.duration) < 1) {
      errors.duration = 'Duration must be at least 1 hour';
      isValid = false;
    }
    
    setReservationErrors(errors);
    return isValid;
  };
  
  // Handle reservation submit
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateReservation() || !selectedSlot) return;
    
    setProcessingPayment(true);
    
    try {
      // Calculate start and end times
      const startDateTime = new Date(`${reservationDetails.startDate}T${reservationDetails.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(reservationDetails.duration) * 60 * 60 * 1000);
      
      // Create reservation
      const reservation = await createReservation(
        selectedSlot.id,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );
      
      setCreatedReservation(reservation);
      setProcessingPayment(false);
      // Open payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating reservation:', error);
      setProcessingPayment(false);
    }
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedSlot) return 0;
    
    const duration = parseInt(reservationDetails.duration);
    return selectedSlot.price * duration;
  };
  
  // Handle payment submission
  const handlePaymentSubmit = async (paymentInfo: PaymentInfo) => {
    try {
      // Close payment modal and show success
      setShowPaymentModal(false);
      setReservationSuccessModal(true);
      
      // Reset form
      setReservationDetails({
        startDate: '',
        startTime: '',
        duration: '1',
      });
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };
  
  // Handle reservation completion
  const handleReservationComplete = () => {
    setReservationSuccessModal(false);
    setCreatedReservation(null);
    selectSlot(null);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Find and Reserve Parking</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ParkingFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            floorOptions={floorOptions}
            sectionOptions={sectionOptions}
            typeOptions={typeOptions}
          />
        </div>
        
        <div className="lg:col-span-3">
          {selectedSlot ? (
            <div className="mb-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Selected Parking Spot</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectSlot(null)}
                >
                  Change Selection
                </Button>
              </div>
              
              <Card className="border-blue-300 bg-blue-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Section {selectedSlot.section}, Spot {selectedSlot.number}
                    </h3>
                    <p className="text-sm text-gray-600">Floor {selectedSlot.floor}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedSlot.type} parking
                    </p>
                    <p className="mt-1 text-blue-800 font-medium">
                      ₹{selectedSlot.price} per hour
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <form onSubmit={handleReservationSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Input
                            label="Date"
                            name="startDate"
                            type="date"
                            value={reservationDetails.startDate}
                            onChange={handleReservationChange}
                            min={today}
                            error={reservationErrors.startDate}
                            leftIcon={<Calendar size={16} />}
                          />
                        </div>
                        
                        <div>
                          <Input
                            label="Time"
                            name="startTime"
                            type="time"
                            value={reservationDetails.startTime}
                            onChange={handleReservationChange}
                            error={reservationErrors.startTime}
                            leftIcon={<Clock size={16} />}
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Duration (hours)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                              <CalendarClock size={16} />
                            </div>
                            <select
                              name="duration"
                              value={reservationDetails.duration}
                              onChange={handleReservationChange}
                              className={`rounded-md border px-3 py-2 pl-10 w-full ${
                                reservationErrors.duration 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-gray-300 focus:ring-blue-500'
                              } focus:outline-none focus:ring-2 transition`}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 12, 24].map(hour => (
                                <option key={hour} value={hour}>
                                  {hour} {hour === 1 ? 'hour' : 'hours'}
                                </option>
                              ))}
                            </select>
                          </div>
                          {reservationErrors.duration && (
                            <p className="mt-1 text-sm text-red-600">{reservationErrors.duration}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <span className="text-gray-700">Total:</span>
                          <span className="ml-1 text-lg font-bold">
                            ₹{calculateTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isLoading || processingPayment}
                          rightIcon={<CreditCard size={18} />}
                        >
                          Reserve & Pay
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center text-gray-700 text-sm mb-2">
                <Info size={16} className="mr-2 text-blue-600" />
                <span>Select a parking spot from the available options below</span>
              </div>
            </div>
          )}
          
          <ParkingGrid
            slots={parkingSlots}
            selectedSlotId={selectedSlot?.id || null}
            onSelectSlot={handleSelectSlot}
            filter={filter}
          />
        </div>
      </div>
      
      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Details"
        size="md"
      >
        <PaymentForm
          amount={createdReservation?.totalPrice || calculateTotalPrice()}
          reservationId={createdReservation?.id}
          onSubmit={handlePaymentSubmit}
          onCancel={() => setShowPaymentModal(false)}
          isLoading={processingPayment}
        />
      </Modal>
      
      {/* Reservation Success Modal */}
      <Modal
        isOpen={reservationSuccessModal}
        onClose={handleReservationComplete}
        title="Reservation Confirmed"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your spot is reserved!</h3>
          <p className="text-gray-600 mb-4">You will receive a confirmation with all the details about your reservation.</p>
          
          <Button
            variant="primary"
            onClick={handleReservationComplete}
            fullWidth
          >
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ParkingPage;