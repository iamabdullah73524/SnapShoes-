const express = require('express');
const router = express.Router();
const { getModel } = require('../config/db');
const { auth } = require('../middleware/auth');

// ==========================================
// 1. Get User Notifications
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const Notification = getModel('Notification');
    
    // Determine user identifier: 'admin' if user is admin, else user ID
    const targetUserId = req.user.role === 'admin' ? 'admin' : req.user.id;
    
    const notifications = await Notification.find({ userId: targetUserId });
    
    // Sort newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// ==========================================
// 2. Mark Single Notification as Read
// ==========================================
router.put('/:id/read', auth, async (req, res) => {
  try {
    const Notification = getModel('Notification');
    const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification status' });
  }
});

// ==========================================
// 3. Mark All Notifications as Read
// ==========================================
router.put('/read-all', auth, async (req, res) => {
  try {
    const Notification = getModel('Notification');
    const targetUserId = req.user.role === 'admin' ? 'admin' : req.user.id;
    
    const notifications = await Notification.find({ userId: targetUserId });
    for (const notif of notifications) {
      if (!notif.isRead) {
        await Notification.findByIdAndUpdate(notif._id, { isRead: true });
      }
    }
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

module.exports = router;
