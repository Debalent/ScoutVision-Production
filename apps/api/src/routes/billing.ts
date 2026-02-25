import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

// POST /billing/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  const { priceId, customerEmail } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: req.headers.origin + '/billing/success',
      cancel_url: req.headers.origin + '/billing/cancel',
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(400).json({ error: 'Stripe error', details: e });
  }
});

export default router;
