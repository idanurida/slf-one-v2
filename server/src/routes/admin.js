// server/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder: Admin dashboard routes
// TODO: Implement admin controller and wire up actual logic

router.get('/dashboard', protect, authorize(['superadmin', 'admin_lead']), (req, res) => {
  res.json({ message: 'GET /api/admin/dashboard - Admin dashboard (placeholder)' });
});

router.get('/stats', protect, authorize(['superadmin', 'admin_lead']), (req, res) => {
  res.json({ message: 'GET /api/admin/stats - Admin stats (placeholder)' });
});

router.get('/users', protect, authorize(['superadmin']), (req, res) => {
  res.json({ message: 'GET /api/admin/users - List all users (placeholder)' });
});

module.exports = router;
