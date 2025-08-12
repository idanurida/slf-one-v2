// server/src/routes/checklists.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getChecklistItems,
  getChecklistItemById,
  addChecklistResponse,
  getChecklistResponses
} = require('../controllers/checklistController');

// Public routes (authenticated only)
router.get('/checklist-items', protect, getChecklistItems);
router.get('/checklist-items/:id', protect, getChecklistItemById);

// Protected routes for inspectors
router.post('/inspections/:inspectionId/checklist-responses', protect, authorize(['inspektor']), addChecklistResponse);
router.get('/inspections/:inspectionId/checklist-responses', protect, getChecklistResponses);

module.exports = router;