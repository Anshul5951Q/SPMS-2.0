import express from 'express';
import { createPaymentIntent, confirmPayment } from '../controllers/paymentController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/create-payment-intent', auth, createPaymentIntent);
router.post('/confirm-payment', auth, confirmPayment);

export default router; 