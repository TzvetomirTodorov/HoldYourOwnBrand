/**
 * Webhook Routes
 * 
 * Handles webhooks from external services like Stripe.
 * These endpoints receive notifications about events that happen
 * outside our application (like payment completions).
 * 
 * IMPORTANT: Webhooks must verify the request signature to ensure
 * the request actually came from the expected service, not an attacker.
 */

const express = require('express');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/webhooks/stripe
 * 
 * Handles Stripe webhook events.
 * The raw body is required for signature verification (set up in index.js).
 */
router.post('/stripe', asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      
      // Update order status
      await db.query(`
        UPDATE orders 
        SET payment_status = 'paid', status = 'paid'
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntent.id]);
      
      console.log(`✅ Payment succeeded for order with PI: ${paymentIntent.id}`);
      
      // TODO: Send order confirmation email
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      
      await db.query(`
        UPDATE orders 
        SET payment_status = 'failed'
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntent.id]);
      
      console.log(`❌ Payment failed for PI: ${paymentIntent.id}`);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      
      // Check if fully or partially refunded
      const status = charge.amount_refunded === charge.amount 
        ? 'refunded' 
        : 'partially_refunded';
      
      await db.query(`
        UPDATE orders 
        SET payment_status = $1, status = CASE WHEN $1 = 'refunded' THEN 'refunded' ELSE status END
        WHERE stripe_payment_intent_id = $2
      `, [status, charge.payment_intent]);
      
      console.log(`💰 Refund processed: ${status}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
}));

module.exports = router;
