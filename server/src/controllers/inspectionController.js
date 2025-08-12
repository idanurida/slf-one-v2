// server/src/controllers/inspectionController.js
const Inspection = require('../models/Inspection');
const Project = require('../models/Project');
const ChecklistItem = require('../models/ChecklistItem');
const ChecklistResponse = require('../models/ChecklistResponse');
const Photo = require('../models/Photo');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Get inspector's scheduled inspections
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getMyInspections = async (req, res) => {
  try {
    const { status, date_from, date_to } = req.query;

    const whereConditions = { 
      inspector_id: req.user.id,
      is_active: true 
    };

    if (status) {
      whereConditions.status = status;
    }

    if (date_from || date_to) {
      whereConditions.scheduled_date = {};
      if (date_from) {
        whereConditions.scheduled_date[Sequelize.Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereConditions.scheduled_date[Sequelize.Op.lte] = new Date(date_to);
      }
    }

    const inspections = await Inspection.findAll({
      where: whereConditions,
      include: [{
        model: Project,
        attributes: ['id', 'name', 'owner_name', 'address', 'building_function']
      }],
      order: [['scheduled_date', 'ASC']]
    });

    res.json(inspections);
  } catch (error) {
    console.error('Get my inspections error:', error);
    res.status(500).json({ error: 'Server error while fetching inspections' });
  }
};

/**
 * Start inspection (only if scheduled and within time window)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.startInspection = async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await Inspection.findByPk(id, {
      include: [{
        model: Project,
        attributes: ['id', 'name', 'owner_name', 'address']
      }]
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Validasi: hanya bisa dimulai oleh inspector yang ditugaskan
    if (inspection.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to start this inspection' });
    }

    // Validasi: hanya bisa dimulai jika status scheduled
    if (inspection.status !== 'scheduled') {
      return res.status(400).json({ error: 'Inspection cannot be started. Current status: ' + inspection.status });
    }

    // Validasi: hanya bisa dimulai dalam waktu 30 menit sebelum atau sesudah jadwal
    const scheduledTime = new Date(inspection.scheduled_date);
    const currentTime = new Date();
    const timeDiff = Math.abs(currentTime - scheduledTime);
    const thirtyMinutes = 30 * 60 * 1000; // 30 menit dalam milidetik

    if (timeDiff > thirtyMinutes) {
      return res.status(400).json({ 
        error: 'Inspection can only be started within 30 minutes of scheduled time',
        scheduled_time: scheduledTime,
        current_time: currentTime
      });
    }

    // Update status inspection
    await inspection.update({
      status: 'in_progress',
      started_at: new Date()
    });

    // Kirim notifikasi ke project lead
    await Notification.create({
      user_id: inspection.project.project_lead_id,
      title: 'Inspection Started',
      message: `Inspection for project "${inspection.project.name}" has been started by ${req.user.name}`,
      priority: 'medium',
      action_required: false,
      action_url: `/dashboard/project-lead/inspections/${inspection.id}`
    });

    res.json(inspection);
  } catch (error) {
    console.error('Start inspection error:', error);
    res.status(500).json({ error: 'Server error while starting inspection' });
  }
};

/**
 * Get checklist items for inspection (only if in_progress)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getInspectionChecklist = async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Validasi: hanya bisa mengakses checklist jika status in_progress
    if (inspection.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Checklist can only be accessed when inspection is in progress',
        current_status: inspection.status
      });
    }

    // Validasi: hanya bisa diakses oleh inspector yang ditugaskan
    if (inspection.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this inspection checklist' });
    }

    // Ambil checklist items berdasarkan kategori dan applicable_for
    const checklistItems = await ChecklistItem.findAll({
      where: {
        is_active: true,
        category: inspection.project.building_function // Sesuaikan dengan logika bisnis Anda
      },
      order: [['code', 'ASC']]
    });

    res.json(checklistItems);
  } catch (error) {
    console.error('Get inspection checklist error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist items' });
  }
};

/**
 * Add checklist response for inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.addChecklistResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist_item_id, sample_number, response_data } = req.body;

    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Validasi: hanya bisa menambahkan respons jika status in_progress
    if (inspection.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Checklist responses can only be added when inspection is in progress',
        current_status: inspection.status
      });
    }

    // Validasi: hanya bisa diakses oleh inspector yang ditugaskan
    if (inspection.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add checklist responses' });
    }

    // Validasi checklist item
    const checklistItem = await ChecklistItem.findByPk(checklist_item_id);
    if (!checklistItem) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Buat checklist response
    const response = await ChecklistResponse.create({
      inspection_id: parseInt(id),
      checklist_item_id: checklist_item_id,
      sample_number: sample_number || null,
      response_ response_data || {}
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Add checklist response error:', error);
    res.status(500).json({ error: 'Server error while adding checklist response' });
  }
};

/**
 * Complete inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.completeInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const inspection = await Inspection.findByPk(id, {
      include: [{
        model: Project,
        attributes: ['id', 'name', 'owner_name', 'project_lead_id']
      }]
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Validasi: hanya bisa diselesaikan oleh inspector yang ditugaskan
    if (inspection.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to complete this inspection' });
    }

    // Validasi: hanya bisa diselesaikan jika status in_progress
    if (inspection.status !== 'in_progress') {
      return res.status(400).json({ error: 'Inspection cannot be completed. Current status: ' + inspection.status });
    }

    // Update status inspection
    await inspection.update({
      status: 'completed',
      completed_at: new Date(),
      notes: notes || inspection.notes
    });

    // Kirim notifikasi ke project lead
    await Notification.create({
      user_id: inspection.project.project_lead_id,
      title: 'Inspection Completed',
      message: `Inspection for project "${inspection.project.name}" has been completed by ${req.user.name}`,
      priority: 'medium',
      action_required: true,
      action_url: `/dashboard/project-lead/inspections/${inspection.id}`
    });

    res.json(inspection);
  } catch (error) {
    console.error('Complete inspection error:', error);
    res.status(500).json({ error: 'Server error while completing inspection' });
  }
};

/**
 * Get inspection photos
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getInspectionPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Validasi: hanya bisa mengakses foto jika status in_progress atau completed
    if (!['in_progress', 'completed'].includes(inspection.status)) {
      return res.status(400).json({ 
        error: 'Photos can only be accessed when inspection is in progress or completed',
        current_status: inspection.status
      });
    }

    // Validasi: hanya bisa diakses oleh inspector yang ditugaskan
    if (inspection.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access inspection photos' });
    }

    const photos = await Photo.findAll({
      where: { inspection_id: id },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(photos);
  } catch (error) {
    console.error('Get inspection photos error:', error);
    res.status(500).json({ error: 'Server error while fetching photos' });
  }
};

/**
 * Upload photo for inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.uploadPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await Inspection.findByPk(id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Validasi: hanya bisa mengunggah foto jika status in_progress
    if (inspection.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Photos can only be uploaded when inspection is in progress',
        current_status: inspection.status
      });
    }

    // Validasi: hanya bisa diakses oleh inspector yang ditugaskan
    if (inspection.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to upload photos' });
    }

    // Validasi file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Buat photo record
    const photo = await Photo.create({
      inspection_id: parseInt(id),
      file_path: req.file.path,
      caption: req.body.caption || null,
      floor_info: req.body.floor_info || null,
      room_info: req.body.room_info || null,
      building_info: req.body.building_info || null,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      altitude: req.body.altitude ? parseFloat(req.body.altitude) : null,
      gps_accuracy: req.body.gps_accuracy ? parseFloat(req.body.gps_accuracy) : null,
      heading: req.body.heading ? parseFloat(req.body.heading) : null,
      manual_location: req.body.manual_location || null,
      uploaded_by: req.user.id,
      file_size: req.file.size,
      file_type: req.file.mimetype
    });

    res.status(201).json(photo);
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Server error while uploading photo' });
  }
};

module.exports = {
  getMyInspections,
  startInspection,
  getInspectionChecklist,
  addChecklistResponse,
  completeInspection,
  getInspectionPhotos,
  uploadPhoto
};