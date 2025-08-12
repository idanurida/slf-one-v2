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
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Human-readable description'
  },
  column_config: {
    type: DataTypes.JSONB || DataTypes.TEXT,
    allowNull: false,
    comment: 'Dynamic column configuration from JSON template'
  },
  applicable_for: {
    type: DataTypes.ARRAY(DataTypes.STRING) || DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Array of request types this item applies to'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'checklist_items',
  underscored: true,
  indexes: [
    {
      unique: false,
      fields: ['category']
    },
    {
      unique: false,
      fields: ['code']
    }
  ]
});

module.exports = ChecklistItem;