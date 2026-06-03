import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

// Allowlist of Stripe price ID prefixes — prevents arbitrary string injection
const PRICE_ID_PATTERN = /^price_[A-Za-z0-9]+$/;

// POST /billing/create-checkout-session
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  const { priceId, customerEmail } = req.body as { priceId?: string; customerEmail?: string };

  if (!priceId || !PRICE_ID_PATTERN.test(priceId)) {
    return res.status(400).json({ error: 'Invalid priceId' });
  }
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid customerEmail' });
  }

  // Validate and restrict the origin to prevent open redirect via success/cancel URLs
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((o) => o.trim());
  const requestOrigin = req.headers.origin ?? allowedOrigins[0];
  const safeOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${safeOrigin}/billing/success`,
      cancel_url: `${safeOrigin}/billing/cancel`,
    });
    res.json({ url: session.url });
  } catch {
    res.status(400).json({ error: 'Stripe error' });
  }
});

export default router;
