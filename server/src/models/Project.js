// server/src/models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  owner_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  building_function: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  floors: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  height: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true
  },
  area: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coordinates: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  request_type: {
    type: DataTypes.ENUM(
      'baru',
      'perpanjangan_slf',
      'perubahan_fungsi',
      'pascabencana'
    ),
    allowNull: false
  },
  project_lead_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'quotation_sent',
      'quotation_accepted',
      'contract_signed',
      'spk_issued',
      'spk_accepted',
      'inspection_scheduled',
      'inspection_in_progress',
      'inspection_done',
      'report_draft',
      'report_reviewed',
      'report_sent_to_client',
      'waiting_gov_response',
      'slf_issued',
      'completed',
      'cancelled'
    ),
    defaultValue: 'draft'
  }
}, {
  timestamps: true,
  tableName: 'projects',
  underscored: true
});

module.exports = Project;