import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Payment form submitted');

    if (!stripe || !elements) {
      console.error('Stripe or Elements not initialized');
      setError('Payment system is not ready. Please try again.');
      return;
    }

    if (!token) {
      console.error('No authentication token found');
      setError('Please log in to make a payment');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating payment intent for amount:', amount);
      // Create payment intent
      const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          amount,
          currency: 'inr' // Explicitly set currency to INR
        }),
      });

      const responseData = await response.json();
      console.log('Payment intent response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = responseData;
      console.log('Payment intent created with client secret');

      // Confirm the payment
      console.log('Confirming payment with Stripe...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      console.log('Stripe payment response:', { stripeError, paymentIntent });

      if (stripeError) {
        console.error('Stripe payment error:', stripeError);
        setError(stripeError.message || 'An error occurred');
        onPaymentError(stripeError.message || 'An error occurred');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess();
      } else {
        console.error('Payment not succeeded:', paymentIntent);
        setError('Payment was not successful. Please try again.');
        onPaymentError('Payment was not successful. Please try again.');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing your payment';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
        <p className="text-gray-600 mb-4">Amount to pay: ₹{amount.toFixed(2)}</p>
        <div className="border rounded-md p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default PaymentForm; 