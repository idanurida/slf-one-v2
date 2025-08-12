// server/src/models/ChecklistItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ChecklistItem = sequelize.define('ChecklistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique code from JSON template (e.g., surat_permohonan_slf, pondasi)'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Category from JSON template (administrative, tata_bangunan, keandalan)'
  },
  specialization: {
    type: DataTypes.ENUM(
      'administrative',     // Dokumen Administratif
      'tata_bangunan',      // Tata Bangunan
      'struktur',           // Struktur Bangunan
      'utilitas',           // Utilitas (listrik, air, gas)
      'keselamatan',        // Keselamatan Kebakaran
      'aksesibilitas',      // Aksesibilitas Disabilitas
      'kenyamanan',         // Kenyamanan Lingkungan
      'sanitasi'            // Sanitasi & Tata Air
    ),
    allowNull: true,
    comment: 'Bidang spesialisasi inspektor yang menangani item ini'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Human-readable description'
  },
  column_config: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Dynamic column configuration from JSON template'
  },
  applicable_for: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    comment: 'Array of request types this item applies to'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Flag indicating if the item is active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp of creation'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp of last update'
  }
}, {
  timestamps: false, // Nonaktifkan timestamps otomatis karena kita menggunakan created_at/updated_at manual
  tableName: 'checklist_items',
  underscored: true,
  comment: 'Tabel untuk menyimpan template item checklist'
});

module.exports = ChecklistItem;