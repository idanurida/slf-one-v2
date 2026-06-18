// server/src/models/SimakResponse.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const SimakResponse = sequelize.define('SimakResponse', {
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
  simak_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'simak_items',
      key: 'id'
    },
    comment: 'ID item simak yang direspons'
  },
  sample_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nomor sampel untuk item ini (jika ada)'
  },
  location_detail: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detail lokasi item simak'
  },
  year_built: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tahun pembangunan item'
  },
  size: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ukuran item (panjang x lebar x tinggi)'
  },
  material: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Material yang digunakan'
  },
  damage_level: {
    type: DataTypes.ENUM('tidak_ada', 'kecil', 'sedang', 'besar'),
    allowNull: true,
    comment: 'Tingkat kerusakan item'
  },
  specific_damage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Jenis kerusakan spesifik'
  },
  overall_condition: {
    type: DataTypes.ENUM('kurang', 'sedang', 'baik', 'sangat_baik'),
    allowNull: true,
    comment: 'Kondisi keseluruhan item'
  },
  estimated_useful_life: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimasi sisa umur (tahun)'
  },
  conclusion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kesimpulan akhir tentang item'
  },
  response_data: {
    type: DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Data respons dinamis dari inspektor berdasarkan column_config item'
  }
}, {
  timestamps: true,
  tableName: 'simak_responses',
  underscored: true
});

module.exports = SimakResponse;