const express = require('express');
const router = express.Router();
const { getModel } = require('../config/db');
const { auth, admin } = require('../middleware/auth');

// ==========================================
// 1. User: Place Secure Order
// ==========================================
router.post('/', auth, async (req, res) => {
  const { items, shippingAddress, totalPrice, paymentMethod } = req.body;

  if (!items || !items.length || !shippingAddress || !totalPrice) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  try {
    const Order = getModel('Order');
    const Product = getModel('Product');
    const Notification = getModel('Notification');

    // Verify inventory and update
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (dbProduct.inventory < item.quantity) {
        return res.status(400).json({ message: `Insufficient inventory for ${item.name}` });
      }

      // Deduct inventory
      await Product.findByIdAndUpdate(item.productId, {
        inventory: dbProduct.inventory - item.quantity
      });
    }

    // Create Order
    const newOrder = await Order.create({
      userId: req.user.id,
      items,
      shippingAddress,
      totalPrice,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'Pending',
      trackingHistory: [{
        status: 'Pending',
        comment: 'Order placed successfully.'
      }]
    });

    // Create real-time notification in system DB for admins
    await Notification.create({
      userId: 'admin',
      message: `New order placed! Order ID: ${newOrder._id} for ₹${newOrder.totalPrice.toFixed(2)}`,
      type: 'OrderPlaced'
    });

    // TODO: If you want WhatsApp alerts from the backend, add your WhatsApp API / Twilio client call here.
    // Example: sendWhatsAppToAdmin(`New order ${newOrder._id} from ${shippingAddress.fullName}`);

    // Trigger Real-Time socket update to Admins
    if (req.io) {
      req.io.emit('new_order_alert', {
        orderId: newOrder._id,
        totalPrice: newOrder.totalPrice,
        customerName: shippingAddress.fullName,
        message: `New order from ${shippingAddress.fullName}!`
      });
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ message: 'Error processing order placement' });
  }
});

// ==========================================
// 2. User: Get Personal Order History
// ==========================================
router.get('/my-orders', auth, async (req, res) => {
  try {
    const Order = getModel('Order');
    const orders = await Order.find({ userId: req.user.id });
    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order history' });
  }
});

// ==========================================
// 3. Admin: Get All Customer Orders
// ==========================================
router.get('/all', auth, admin, async (req, res) => {
  try {
    const Order = getModel('Order');
    const orders = await Order.find();
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customer orders' });
  }
});

// ==========================================
// 4. Admin: Update Order Status
// ==========================================
router.put('/:id/status', auth, admin, async (req, res) => {
  const { status, comment } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please provide status update value' });
  }

  try {
    const Order = getModel('Order');
    const Notification = getModel('Notification');

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Append to tracking history
    const history = order.trackingHistory || [];
    history.push({
      status,
      timestamp: new Date(),
      comment: comment || `Order status updated to ${status}`
    });

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
      status,
      trackingHistory: history
    }, { new: true });

    // Create user notification
    const alertMsg = `Your order #${order._id} status is now ${status}!`;
    await Notification.create({
      userId: order.userId.toString(),
      message: alertMsg,
      type: 'StatusChange'
    });

    // Trigger Real-Time Socket Update to Customer Room
    if (req.io) {
      req.io.to(order.userId.toString()).emit('order_status_update', {
        orderId: order._id,
        status,
        message: alertMsg
      });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

module.exports = router;
