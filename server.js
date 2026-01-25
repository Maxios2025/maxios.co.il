
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe once
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('FATAL: STRIPE_SECRET_KEY is not set');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 2,
    timeout: 30000,
    telemetry: false, // Disable telemetry to reduce network noise
});

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        await stripe.paymentIntents.list({ limit: 1 });
        res.json({ status: 'ok', message: 'Backend is connected to Stripe' });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        console.log('----------------------------------------');
        console.log(`Received payment request.`);
        console.log(`Amount: ${amount}`);
        console.log(`Metadata keys: ${Object.keys(metadata).join(', ')}`);

        if (!amount || isNaN(amount) || amount < 50) {
            console.warn('Invalid amount:', amount);
            return res.status(400).json({ error: 'Invalid amount. Minimum is 50 cents.' });
        }

        // Simplification: Try without complex metadata first if it fails repeatedly?
        // For now, let's pass it but log if it fails.

        console.log('Creating PaymentIntent with Stripe...');
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency,
            automatic_payment_methods: { enabled: true },
            metadata: { ...metadata, source: 'maxios_store' }
        });

        console.log('PaymentIntent created successfully:', paymentIntent.id);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Stripe API Error:', error);
        console.error('Error Type:', error.type);
        console.error('Error Code:', error.code);
        console.error('Error Detail:', error.raw ? error.raw.message : 'No raw message');

        // Return the specific error message from Stripe
        res.status(500).json({
            error: error.message || 'Payment failed',
            type: error.type,
            code: error.code
        });
    }
});

// Start server
app.listen(port, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
    console.log('Stripe configured with key ending in:', process.env.STRIPE_SECRET_KEY.slice(-4));
});
