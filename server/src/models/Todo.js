// server/src/models/Todo.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul tugas/todo'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi detail tugas'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang ditugaskan'
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang memberikan tugas'
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'ID proyek terkait (jika ada)'
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
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal jatuh tempo tugas'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    comment: 'Prioritas tugas'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'Status tugas'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Progress tugas dalam persentase (0-100)'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal tugas selesai'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal tugas dibatalkan'
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alasan pembatalan tugas'
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah tugas berulang'
  },
  recurrence_pattern: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Pola pengulangan (daily, weekly, monthly)'
  },
  parent_todo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'todos',
      key: 'id'
    },
    comment: 'ID todo parent (untuk sub-tasks)'
  },
  related_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipe entitas terkait (project, inspection, report, dll)'
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID entitas terkait'
  },
  action_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah tugas memerlukan tindakan'
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL untuk tindakan spesifik'
  }
}, {
  timestamps: true,
  tableName: 'todos',
  underscored: true
});

module.exports = Todo;