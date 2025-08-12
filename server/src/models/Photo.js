// server/src/models/Photo.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inspection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inspections',
      key: 'id'
    },
    comment: 'ID inspeksi terkait'
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'ID proyek terkait (opsional)'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path file foto'
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Keterangan foto'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Latitude koordinat foto diambil'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Longitude koordinat foto diambil'
  },
  floor_info: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Informasi lantai/tempat foto diambil'
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang mengunggah foto'
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Ukuran file dalam bytes'
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipe file (jpeg, png, etc)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif foto'
  }
}, {
  timestamps: true,
  tableName: 'photos',
  underscored: true
});

module.exports = Photo;