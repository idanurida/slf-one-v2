// server/src/models/ChecklistResponse.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ChecklistResponse = sequelize.define('ChecklistResponse', {
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
  checklist_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'checklist_items',
      key: 'id'
    },
    comment: 'ID item checklist yang direspons'
  },
  sample_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nomor sampel untuk item ini'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang membuat respons'
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    comment: 'ID proyek terkait'
  },
  response_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Data respons dinamis dari inspektor berdasarkan column_config item'
  }
}, {
  timestamps: true,
  tableName: 'checklist_responses',
  underscored: true
});

module.exports = ChecklistResponse;
