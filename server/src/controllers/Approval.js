// server/src/models/Approval.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Approval = sequelize.define('Approval', {
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
    comment: 'ID proyek yang disetujui'
  },
  report_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'reports',
      key: 'id'
    },
    comment: 'ID laporan yang disetujui (jika ada)'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang memberikan approval'
  },
  role: {
    type: DataTypes.ENUM(
      'project_lead',
      'head_consultant',
      'klien'
    ),
    allowNull: false,
    comment: 'Role yang memberikan approval'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: 'Status approval'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar dari approver'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal approval'
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal penolakan'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alasan penolakan (jika status rejected)'
  }
}, {
  timestamps: true,
  tableName: 'approvals',
  underscored: true
});

module.exports = Approval;