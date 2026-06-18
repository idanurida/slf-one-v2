// server/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder: Notification routes
// TODO: Implement notification controller and wire up actual logic

router.get('/', protect, (req, res) => {
  res.json({ message: 'GET /api/notifications - List notifications (placeholder)' });
});

router.get('/unread', protect, (req, res) => {
  res.json({ message: 'GET /api/notifications/unread - Unread notifications (placeholder)' });
});

router.put('/:id/read', protect, (req, res) => {
  res.json({ message: `PUT /api/notifications/${req.params.id}/read - Mark read (placeholder)` });
});

router.put('/read-all', protect, (req, res) => {
  res.json({ message: 'PUT /api/notifications/read-all - Mark all read (placeholder)' });
});

module.exports = router;
