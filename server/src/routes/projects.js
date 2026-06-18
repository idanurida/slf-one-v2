// server/src/routes/projects.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Placeholder: Project CRUD routes
// TODO: Implement project controller and wire up actual logic

router.get('/', protect, (req, res) => {
  res.json({ message: 'GET /api/projects - List projects (placeholder)' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ message: `GET /api/projects/${req.params.id} - Get project (placeholder)` });
});

router.post('/', protect, authorize(['superadmin', 'project_lead']), (req, res) => {
  res.status(201).json({ message: 'POST /api/projects - Create project (placeholder)' });
});

router.put('/:id', protect, authorize(['superadmin', 'project_lead']), (req, res) => {
  res.json({ message: `PUT /api/projects/${req.params.id} - Update project (placeholder)` });
});

router.delete('/:id', protect, authorize(['superadmin']), (req, res) => {
  res.json({ message: `DELETE /api/projects/${req.params.id} - Delete project (placeholder)` });
});

module.exports = router;
