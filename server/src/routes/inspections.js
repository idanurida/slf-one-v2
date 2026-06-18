// server/src/routes/inspections.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const inspectionController = require('../controllers/inspectionController');

// Inspector routes
router.get('/my-inspections', protect, authorize(['inspektor']), inspectionController.getMyInspections);
router.post('/:id/start', protect, authorize(['inspektor']), inspectionController.startInspection);
router.get('/:id/checklist', protect, authorize(['inspektor']), inspectionController.getInspectionChecklist);
router.post('/:id/checklist-responses', protect, authorize(['inspektor']), inspectionController.addChecklistResponse);
router.post('/:id/complete', protect, authorize(['inspektor']), inspectionController.completeInspection);
router.get('/:id/photos', protect, inspectionController.getInspectionPhotos);
router.post('/:id/photos', protect, authorize(['inspektor']), inspectionController.uploadPhoto);

// Generic CRUD (placeholder for missing controller methods)
router.get('/', protect, (req, res) => {
  res.json({ message: 'GET /api/inspections - List inspections (placeholder)' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ message: `GET /api/inspections/${req.params.id} - Get inspection (placeholder)` });
});

router.post('/', protect, authorize(['superadmin', 'project_lead']), (req, res) => {
  res.status(201).json({ message: 'POST /api/inspections - Create inspection (placeholder)' });
});

router.put('/:id', protect, authorize(['superadmin', 'project_lead', 'inspektor']), (req, res) => {
  res.json({ message: `PUT /api/inspections/${req.params.id} - Update inspection (placeholder)` });
});

router.delete('/:id', protect, authorize(['superadmin']), (req, res) => {
  res.json({ message: `DELETE /api/inspections/${req.params.id} - Delete inspection (placeholder)` });
});

module.exports = router;
