// server/src/models/Payment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Payment = sequelize.define('Payment', {
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
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Jumlah pembayaran'
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal pembayaran dilakukan'
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal jatuh tempo pembayaran'
  },
  proof_file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path file bukti pembayaran'
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    comment: 'Status verifikasi pembayaran'
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID admin lead yang memverifikasi'
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal verifikasi'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alasan penolakan pembayaran'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan'
  }
}, {
  timestamps: true,
  tableName: 'payments',
  underscored: true
});

module.exports = Payment;