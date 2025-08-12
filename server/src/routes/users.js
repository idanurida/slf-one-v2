// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getMyProfile,
  updateMyProfile
} = require('../controllers/userController');

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Users API is running' });
});

// Protected routes for all authenticated users
router.route('/me')
  .get(protect, getMyProfile)
  .put(protect, updateMyProfile);

router.route('/change-password')
  .put(protect, changePassword);

// Protected routes for superadmin only
router.route('/')
  .get(protect, authorize('superadmin'), getUsers)
  .post(protect, authorize('superadmin'), createUser);

router.route('/:id')
  .get(protect, authorize('superadmin'), getUserById)
  .put(protect, authorize('superadmin'), updateUser)
  .delete(protect, authorize('superadmin'), deleteUser);

module.exports = router;