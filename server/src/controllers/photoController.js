// server/src/controllers/photoController.js
const Photo = require('../models/Photo');
const Inspection = require('../models/Inspection');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload photo dengan geotagging
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.uploadPhoto = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const { 
      caption, 
      latitude, 
      longitude, 
      floor_info, 
      room_info, 
      building_info, 
      manual_location,
      gps_accuracy,
      altitude,
      heading
    } = req.body;

    // Verifikasi inspeksi
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validasi file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Hapus file yang tidak valid
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Only JPEG, PNG, and GIF files are allowed' });
    }

    // Validasi file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (req.file.size > maxSize) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'File size exceeds 20MB limit' });
    }

    // Create photo record
    const photo = await Photo.create({
      inspection_id: parseInt(inspectionId),
      file_path: req.file.path.replace(/\\/g, '/'), // Normalize path
      caption: caption || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      floor_info: floor_info || null,
      room_info: room_info || null,
      building_info: building_info || null,
      manual_location: manual_location || null,
      uploaded_by: req.user.id,
      uploaded_at: new Date(),
      file_size: req.file.size,
      file_type: req.file.mimetype,
      gps_accuracy: gps_accuracy ? parseFloat(gps_accuracy) : null,
      altitude: altitude ? parseFloat(altitude) : null,
      heading: heading ? parseFloat(heading) : null,
      is_active: true
    });

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: {
        id: photo.id,
        file_path: photo.file_path,
        caption: photo.caption,
        latitude: photo.latitude,
        longitude: photo.longitude,
        floor_info: photo.floor_info,
        room_info: photo.room_info,
        building_info: photo.building_info,
        manual_location: photo.manual_location,
        uploaded_by: photo.uploaded_by,
        uploaded_at: photo.uploaded_at,
        file_size: photo.file_size,
        file_type: photo.file_type,
        gps_accuracy: photo.gps_accuracy,
        altitude: photo.altitude,
        heading: photo.heading
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    
    // Clean up uploaded file if exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Server error while uploading photo' });
  }
};

/**
 * Get photos for inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getInspectionPhotos = async (req, res) => {
  try {
    const { inspectionId } = req.params;

    // Verifikasi inspeksi
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const photos = await Photo.findAll({
      where: {
        inspection_id: inspectionId,
        is_active: true
      },
      include: [{
        model: require('../models/User'),
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      order: [['uploaded_at', 'DESC']]
    });

    res.json(photos);
  } catch (error) {
    console.error('Get inspection photos error:', error);
    res.status(500).json({ error: 'Server error while fetching photos' });
  }
};

/**
 * Delete photo
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Hapus file fisik
    if (photo.file_path) {
      const fullPath = path.join(__dirname, '..', '..', photo.file_path);
      try {
        await fs.unlink(fullPath);
      } catch (error) {
        console.error('Error deleting photo file:', error);
      }
    }

    // Soft delete photo record
    await photo.update({ is_active: false });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Server error while deleting photo' });
  }
};

/**
 * Update photo metadata
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updatePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { 
      caption, 
      latitude, 
      longitude, 
      floor_info, 
      room_info, 
      building_info, 
      manual_location,
      gps_accuracy,
      altitude,
      heading
    } = req.body;

    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    await photo.update({
      caption: caption || photo.caption,
      latitude: latitude ? parseFloat(latitude) : photo.latitude,
      longitude: longitude ? parseFloat(longitude) : photo.longitude,
      floor_info: floor_info || photo.floor_info,
      room_info: room_info || photo.room_info,
      building_info: building_info || photo.building_info,
      manual_location: manual_location || photo.manual_location,
      gps_accuracy: gps_accuracy ? parseFloat(gps_accuracy) : photo.gps_accuracy,
      altitude: altitude ? parseFloat(altitude) : photo.altitude,
      heading: heading ? parseFloat(heading) : photo.heading
    });

    res.json(photo);
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Server error while updating photo' });
  }
};

// All functions exported via exports.XXX = pattern above