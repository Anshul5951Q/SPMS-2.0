"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPayment = exports.createPaymentIntent = void 0;
const stripe_1 = require("../config/stripe");
const createPaymentIntent = async (req, res) => {
    var _a;
    try {
        const activeStripe = stripe_1.stripe;
        if (!activeStripe) {
            return res.status(503).json({ error: 'Payments are not configured on the server' });
        }
        const { amount, currency = 'inr' } = req.body;
        console.log('Received payment request:', { amount, currency });
        if (!amount) {
            console.error('Amount is missing in request');
            return res.status(400).json({ error: 'Amount is required' });
        }
        if (amount <= 0) {
            console.error('Invalid amount:', amount);
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }
        // Convert amount to paise (smallest unit for INR)
        const amountInPaise = Math.round(amount * 100);
        console.log('Creating payment intent for amount in paise:', amountInPaise);
        const paymentIntent = await activeStripe.paymentIntents.create({
            amount: amountInPaise,
            currency: 'inr', // Force INR currency
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
                originalAmount: amount.toString(),
            },
        });
        console.log('Payment intent created successfully:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status
        });
        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount / 100, // Convert back to rupees for frontend
            currency: paymentIntent.currency,
        });
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error creating payment intent' });
        }
    }
};
exports.createPaymentIntent = createPaymentIntent;
const confirmPayment = async (req, res) => {
    var _a, _b;
    try {
        const activeStripe = stripe_1.stripe;
        if (!activeStripe) {
            return res.status(503).json({ error: 'Payments are not configured on the server' });
        }
        const { paymentIntentId } = req.body;
        console.log('Confirming payment for intent:', paymentIntentId);
        if (!paymentIntentId) {
            console.error('Payment intent ID is missing');
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }
        const paymentIntent = await activeStripe.paymentIntents.retrieve(paymentIntentId);
        console.log('Retrieved payment intent:', {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        });
        if (paymentIntent.metadata.userId !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            console.error('Unauthorized access attempt to payment:', {
                paymentUserId: paymentIntent.metadata.userId,
                requestUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId
            });
            return res.status(403).json({ error: 'Unauthorized access to payment' });
        }
        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100, // Convert back to rupees
            currency: paymentIntent.currency,
        });
    }
    catch (error) {
        console.error('Error confirming payment:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error confirming payment' });
        }
    }
};
exports.confirmPayment = confirmPayment;
