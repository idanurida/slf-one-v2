// server/src/models/Inspection.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Inspection = sequelize.define('Inspection', {
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
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal dan waktu inspeksi dijadwalkan'
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal dan waktu inspeksi selesai'
  },
  inspector_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user dengan role inspektor yang melakukan inspeksi'
  },
  drafter_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user dengan role drafter yang membuat laporan'
  },
  project_lead_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user dengan role project_lead yang mengawasi inspeksi'
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',        // Inspeksi dijadwalkan
      'in_progress',     // Inspeksi sedang berlangsung
      'completed',       // Inspeksi selesai
      'cancelled',       // Inspeksi dibatalkan
      'delayed'          // Inspeksi tertunda
    ),
    defaultValue: 'scheduled',
    comment: 'Status inspeksi saat ini'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan untuk inspeksi'
  },
  location_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan lokasi inspeksi'
  },
  weather_conditions: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Kondisi cuaca saat inspeksi'
  },
  team_members: {
    type: DataTypes.ARRAY(DataTypes.STRING) || DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Daftar anggota tim yang terlibat dalam inspeksi'
  },
  equipment_used: {
    type: DataTypes.ARRAY(DataTypes.STRING) || DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Daftar peralatan yang digunakan dalam inspeksi'
  },
  inspection_type: {
    type: DataTypes.ENUM(
      'initial',
      'follow_up',
      'final',
      'spot_check'
    ),
    defaultValue: 'initial',
    comment: 'Jenis inspeksi'
  },
  inspection_scope: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ruang lingkup inspeksi'
  },
  inspection_findings: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Temuan utama inspeksi'
  },
  inspection_recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Rekomendasi berdasarkan temuan inspeksi'
  },
  inspection_conclusion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kesimpulan akhir inspeksi'
  },
  inspection_report_file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path file laporan inspeksi'
  },
  inspection_report_status: {
    type: DataTypes.ENUM(
      'draft',
      'generated',
      'project_lead_review',
      'project_lead_approved',
      'head_consultant_review',
      'head_consultant_approved',
      'client_review',
      'client_approved',
      'client_rejected',
      'sent_to_government',
      'slf_issued',
      'completed',
      'cancelled'
    ),
    defaultValue: 'draft',
    comment: 'Status laporan inspeksi'
  },
  inspection_report_generated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi dibuat'
  },
  inspection_report_project_lead_reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi direview oleh Project Lead'
  },
  inspection_report_head_consultant_reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi direview oleh Head Consultant'
  },
  inspection_report_client_reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi direview oleh Klien'
  },
  inspection_report_client_approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi disetujui oleh Klien'
  },
  inspection_report_client_rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi ditolak oleh Klien'
  },
  inspection_report_sent_to_government_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi dikirim ke instansi pemerintah'
  },
  inspection_report_slf_issued_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal SLF diterbitkan'
  },
  inspection_report_completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi selesai'
  },
  inspection_report_cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal laporan inspeksi dibatalkan'
  },
  inspection_report_client_approval_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Komentar persetujuan/tolakan klien'
  },
  inspection_report_client_rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alasan penolakan laporan oleh klien'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif inspeksi'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang membuat inspeksi'
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang terakhir mengupdate inspeksi'
  }
}, {
  timestamps: true,
  tableName: 'inspections',
  underscored: true
});

module.exports = Inspection;