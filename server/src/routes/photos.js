// server/src/routes/photos.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadPhoto,
  getInspectionPhotos,
  deletePhoto,
  updatePhoto
} = require('../controllers/photoController');
const multer = require('multer');
const path = require('path');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'photos');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Photo routes
router.post('/inspections/:inspectionId/photos', protect, authorize(['inspektor']), upload.single('photo'), uploadPhoto);
router.get('/inspections/:inspectionId/photos', protect, getInspectionPhotos);
router.put('/photos/:photoId', protect, authorize(['inspektor', 'project_lead']), updatePhoto);
router.delete('/photos/:photoId', protect, authorize(['inspektor', 'project_lead']), deletePhoto);

module.exports = router;