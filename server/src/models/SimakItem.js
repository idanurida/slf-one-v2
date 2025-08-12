// server/src/models/SimakItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const SimakItem = sequelize.define('SimakItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique code from JSON template (e.g., SIM.DINDING.01, SIM.PINTU_JENDELA.02)'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Category from JSON template (Dinding, Pintu dan Jendela, Atap, Lantai, dll)'
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
    defaultValue: true,
    comment: 'Status aktif item simak'
  }
}, {
  timestamps: true,
  tableName: 'simak_items',
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

module.exports = SimakItem;