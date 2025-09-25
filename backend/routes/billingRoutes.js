const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createCreditsCheckoutSession,
  createSubscriptionCheckoutSession,
  handleStripeWebhook,
  cancelSubscriptionImmediately,
  debitCredits,
  creditCredits,
} = require('../controllers/billingController');

// Stripe webhook must receive raw body, so mount separately in server.js
router.post('/checkout/credits', authenticateToken, createCreditsCheckoutSession);
router.post('/checkout/subscription', authenticateToken, createSubscriptionCheckoutSession);

router.post('/cancel-subscription-immediately', authenticateToken, cancelSubscriptionImmediately);
// Credit management
router.post('/credits/debit', authenticateToken, debitCredits);
router.post('/credits/credit', authenticateToken, creditCredits);

module.exports = router;


