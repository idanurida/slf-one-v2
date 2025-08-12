// server/src/models/Report.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'ID proyek terkait'
  },
  inspection_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inspections',
      key: 'id'
    },
    comment: 'ID inspeksi terkait (jika ada)'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul laporan'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path file laporan (PDF/DOCX)'
  },
  file_type: {
    type: DataTypes.ENUM('pdf', 'docx'),
    allowNull: false,
    defaultValue: 'pdf',
    comment: 'Tipe file laporan'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'generated',
      'project_lead_review',
      'project_lead_approved',
      'head_consultant_review',
      'head_consultant_approved',
      'client_review',
      'client_approved',
      'client_rejected',
      'sent_to_government',
      'slf_issued',
      'completed',
      'cancelled'
    ),
    defaultValue: 'draft',
    comment: 'Status laporan'
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang mengenerate laporan'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang mereview laporan'
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan direview'
  },
  sent_to_client_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan dikirim ke klien'
  },
  submitted_to_gov_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan dikirim ke instansi pemerintah'
  },
  client_approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan disetujui klien'
  },
  client_rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan ditolak klien'
  },
  client_approval_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar persetujuan/tolakan klien'
  },
  slf_issued_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal SLF diterbitkan'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan selesai'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan dibatalkan'
  }
}, {
  timestamps: true,
  tableName: 'reports',
  underscored: true
});

module.exports = Report;