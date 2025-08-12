// server/src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const inspectionRoutes = require('./inspections');
const reportRoutes = require('./reports');
const adminRoutes = require('./admin');
const notificationRoutes = require('./notifications');
const todoRoutes = require('./todos');

// Route middleware
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/todos', todoRoutes);

module.exports = router;