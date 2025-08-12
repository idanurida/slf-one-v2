// server/src/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang menerima notifikasi'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul notifikasi'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Isi pesan notifikasi'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Status apakah notifikasi sudah dibaca'
  },
  related_project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'ID proyek terkait (jika ada)'
  },
  related_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipe entitas terkait (project, inspection, todo, approval, payment, document, report)'
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID entitas terkait'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    comment: 'Prioritas notifikasi'
  },
  action_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah notifikasi memerlukan tindakan'
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL untuk tindakan spesifik'
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang mengirim notifikasi (jika ada)'
  },
  sender_role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Role pengirim notifikasi'
  },
  notification_type: {
    type: DataTypes.ENUM(
      'todo_assignment',
      'todo_update',
      'todo_completion',
      'approval_request',
      'approval_decision',
      'payment_verification',
      'document_upload',
      'inspection_schedule',
      'inspection_completion',
      'report_generation',
      'report_submission',
      'report_approval',
      'report_rejection',
      'system_alert',
      'reminder',
      'deadline_warning'
    ),
    defaultValue: 'todo_assignment',
    comment: 'Jenis notifikasi'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal notifikasi dibaca'
  }
}, {
  timestamps: true,
  tableName: 'notifications',
  underscored: true
});

module.exports = Notification;