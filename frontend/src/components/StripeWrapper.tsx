import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripeWrapperProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    console.error('Stripe public key is not defined');
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Payment system is not properly configured. Please contact support.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripeWrapper; 