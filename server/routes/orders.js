import express from 'express';
import { db } from '../services/db.js';
import { requireAuth, requireAdmin } from './auth.js';

const router = express.Router();

/**
 * POST /api/orders
 * Logs an order initiated via WhatsApp checkout
 */
router.post('/', (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      totalAmount,
      whatsappNumber
    } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data. Name and items are required.' });
    }

    const order = db.createOrder({
      userId: userId || null,
      customerName,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      shippingAddress: shippingAddress || null,
      items,
      subtotal: subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingFee: shippingFee || 0,
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      whatsappNumber: whatsappNumber || process.env.WHATSAPP_BUSINESS_NUMBER || '9014567531'
    });

    return res.status(201).json({
      message: 'Order initiated! Directing to WhatsApp confirmation.',
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ error: 'Failed to record order.' });
  }
});

/**
 * GET /api/orders/all (Admin Only: Fetch all customer WhatsApp orders)
 */
router.get('/all', requireAdmin, (req, res) => {
  try {
    const orders = db.getAllOrders();
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch all orders.' });
  }
});

/**
 * GET /api/orders/my-orders (Customer: Fetch my orders)
 */
router.get('/my-orders', requireAuth, (req, res) => {
  try {
    const orders = db.getOrdersByUserId(req.user.id);
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

/**
 * PUT /api/orders/:id/status (Admin Only: Update order status)
 */
router.put('/:id/status', requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const order = db.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.status(200).json({ message: 'Order status updated!', order });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

/**
 * DELETE /api/orders/:id (Admin Only: Delete specific customer order)
 */
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const orderId = req.params.id;
    const success = db.deleteOrder(orderId);
    if (!success) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.status(200).json({ message: `Order #${orderId} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete order.' });
  }
});

/**
 * DELETE /api/orders/all/clear (Admin Only: Clear all orders)
 */
router.delete('/all/clear', requireAdmin, (req, res) => {
  try {
    db.clearAllOrders();
    return res.status(200).json({ message: 'All orders cleared.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear orders.' });
  }
});

export default router;
