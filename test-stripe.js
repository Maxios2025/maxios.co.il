
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 2,
    timeout: 30000,
});

async function test() {
    try {
        console.log('Testing PaymentIntent creation...');
        const amount = 89900;
        const currency = 'usd';
        const metadata = {
            items: JSON.stringify([{ id: 'vac', name: 'MAX-VAC PRO ULTRA', qty: 1 }]),
            source: 'maxios_store'
        };

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: { enabled: true },
            metadata
        });

        console.log('Success! Created PI:', paymentIntent.id);
    } catch (error) {
        console.error('Failed to create PI:');
        console.error(error);
    }
}

test();
