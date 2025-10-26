const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const paypalClient = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Create PayPal Order
 * POST /api/paypal/create-order
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'PHP', bookingId, bookingIds, description } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Create PayPal order request
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'Car Wash Booking',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:19006'}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:19006'}/payment/cancel`
      },
      purchase_units: [{
        description: description || 'Car Wash Service',
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        custom_id: bookingId ? bookingId.toString() : (bookingIds ? bookingIds.join(',') : undefined)
      }]
    });

    // Execute PayPal order creation
    const order = await paypalClient.client().execute(request);

    // Store order ID in database
    if (bookingId) {
      // Single booking
      await pool.query(
        'UPDATE bookings SET paypal_order_id = $1, payment_status = $2 WHERE id = $3',
        [order.result.id, 'pending', bookingId]
      );
    } else if (bookingIds && Array.isArray(bookingIds)) {
      // Multiple bookings (bulk payment)
      for (const id of bookingIds) {
        await pool.query(
          'UPDATE bookings SET paypal_order_id = $1, payment_status = $2 WHERE id = $3',
          [order.result.id, 'pending', id]
        );
      }
    }

    res.json({
      success: true,
      orderId: order.result.id,
      orderData: order.result
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ 
      error: 'Failed to create PayPal order',
      details: error.message 
    });
  }
});

/**
 * Capture PayPal Order (Complete Payment)
 * POST /api/paypal/capture-order/:orderId
 */
router.post('/capture-order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Create capture request
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    // Execute capture
    const capture = await paypalClient.client().execute(request);

    // Update all bookings with this PayPal order ID
    const bookingResult = await pool.query(
      'SELECT id FROM bookings WHERE paypal_order_id = $1',
      [orderId]
    );

    if (bookingResult.rows.length > 0) {
      // Update all bookings associated with this order
      await pool.query(
        `UPDATE bookings 
         SET payment_status = $1, 
             paypal_capture_id = $2,
             payment_completed_at = CURRENT_TIMESTAMP,
             status = $3
         WHERE paypal_order_id = $4`,
        ['completed', capture.result.id, 'confirmed', orderId]
      );
    }

    res.json({
      success: true,
      captureId: capture.result.id,
      captureData: capture.result,
      status: capture.result.status
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ 
      error: 'Failed to capture PayPal order',
      details: error.message 
    });
  }
});

/**
 * Get Order Details
 * GET /api/paypal/order/:orderId
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
    const order = await paypalClient.client().execute(request);

    res.json({
      success: true,
      order: order.result
    });

  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({ 
      error: 'Failed to get order details',
      details: error.message 
    });
  }
});

/**
 * Verify Payment Status
 * GET /api/paypal/verify-payment/:bookingId
 */
router.get('/verify-payment/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.userId;

    // Get booking with payment info
    const result = await pool.query(
      `SELECT b.*, s.name as service_name, s.price as service_price
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    res.json({
      success: true,
      booking: booking,
      paymentStatus: booking.payment_status,
      paypalOrderId: booking.paypal_order_id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error.message 
    });
  }
});

module.exports = router;
