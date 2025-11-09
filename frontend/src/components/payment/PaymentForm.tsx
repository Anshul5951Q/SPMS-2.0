import React, { useState } from 'react';
import { CreditCard, Calendar, Lock, IndianRupee } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { PaymentInfo } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { reservationApi } from '../../services/api';

interface PaymentFormProps {
  amount: number;
  reservationId?: string;
  onSubmit: (paymentInfo: PaymentInfo) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  reservationId,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { token } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [errors, setErrors] = useState<Partial<PaymentInfo>>({});
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format specific fields
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }
    
    setPaymentInfo({
      ...paymentInfo,
      [name]: formattedValue,
    });
    
    // Clear error when field is edited
    if (errors[name as keyof PaymentInfo]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Partial<PaymentInfo> = {};
    
    // Validate card number (simplified - should be 16 digits)
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    
    // Validate name on card
    if (!paymentInfo.nameOnCard) {
      newErrors.nameOnCard = 'Name is required';
    }
    
    // Validate expiry date (MM/YY format)
    if (!paymentInfo.expiryDate || !paymentInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Valid expiry date required (MM/YY)';
    }
    
    // Validate CVV (3 digits)
    if (!paymentInfo.cvv || paymentInfo.cvv.length !== 3) {
      newErrors.cvv = 'Valid CVV required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (reservationId && token) {
      setPaymentProcessing(true);
      try {
        // Update payment status on the backend
        await reservationApi.updatePaymentStatus(token, reservationId);
      } catch (error) {
        console.error('Payment processing error:', error);
      } finally {
        setPaymentProcessing(false);
      }
    }
    
    onSubmit(paymentInfo);
  };
  
  return (
    <div>
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="text-sm text-blue-800">
          <p className="mb-1 font-medium">Test Payment Only</p>
          <p>This is a simulated payment form. No actual payment will be processed.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Card Number"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={paymentInfo.cardNumber}
            onChange={handleChange}
            leftIcon={<CreditCard size={16} />}
            error={errors.cardNumber}
            maxLength={19}
            fullWidth
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Name on Card"
            name="nameOnCard"
            placeholder="John Doe"
            value={paymentInfo.nameOnCard}
            onChange={handleChange}
            error={errors.nameOnCard}
            fullWidth
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Expiry Date"
            name="expiryDate"
            placeholder="MM/YY"
            value={paymentInfo.expiryDate}
            onChange={handleChange}
            leftIcon={<Calendar size={16} />}
            error={errors.expiryDate}
            maxLength={5}
          />
          
          <Input
            label="CVV"
            name="cvv"
            placeholder="123"
            value={paymentInfo.cvv}
            onChange={handleChange}
            leftIcon={<Lock size={16} />}
            error={errors.cvv}
            maxLength={3}
            type="password"
          />
        </div>
        
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold">₹{amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || paymentProcessing}
            fullWidth
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading || paymentProcessing}
            fullWidth
          >
            Pay ₹{amount.toFixed(2)}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;