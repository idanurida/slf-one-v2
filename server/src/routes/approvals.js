// server/src/routes/approvals.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getApprovalsByRole,
  getProjectApprovals,
  approveByRole,
  rejectByRole,
  getApprovalStatus
} = require('../controllers/approvalController');

// Get approvals by role
router.get('/role/:role', protect, authorize(['project_lead', 'head_consultant', 'klien']), getApprovalsByRole);

// Get project approvals
router.get('/projects/:projectId', protect, getProjectApprovals);

// Approval by role
router.post('/projects/:projectId/approve/:role', protect, authorize(['project_lead', 'head_consultant', 'klien']), approveByRole);

// Rejection by role
router.post('/projects/:projectId/reject/:role', protect, authorize(['project_lead', 'head_consultant', 'klien']), rejectByRole);

// Get approval status
router.get('/projects/:projectId/status', protect, getApprovalStatus);

module.exports = router;