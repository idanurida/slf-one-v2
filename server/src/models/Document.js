// server/src/models/Document.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Document = sequelize.define('Document', {
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
  type: {
    type: DataTypes.ENUM(
      'SURAT_PERMOHONAN',
      'AS_BUILT_DRAWINGS',
      'KRK',
      'IMB_LAMA',
      'SLF_LAMA',
      'STATUS_TANAH',
      'FOTO_LOKASI',
      'QUOTATION',
      'CONTRACT',
      'SPK',
      'REPORT',
      'TEKNIS_STRUKTUR',
      'TEKNIS_ARSITEKTUR',
      'TEKNIS_UTILITAS',
      'TEKNIS_SANITASI'
    ),
    allowNull: false,
    comment: 'Jenis dokumen'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul dokumen'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path file dokumen'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Ukuran file dalam bytes'
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipe file (pdf, docx, jpeg, etc)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi dokumen'
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang mengunggah dokumen'
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Status verifikasi dokumen'
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang memverifikasi dokumen'
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal verifikasi dokumen'
  }
}, {
  timestamps: true,
  tableName: 'documents',
  underscored: true
});

module.exports = Document;