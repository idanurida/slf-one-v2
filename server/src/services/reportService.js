// server/src/services/reportService.js
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const Report = require('../models/Report');
const Project = require('../models/Project');
const Inspection = require('../models/Inspection');
const ChecklistResponse = require('../models/ChecklistResponse');
const ChecklistItem = require('../models/ChecklistItem');
const SimakResponse = require('../models/SimakResponse');
const SimakItem = require('../models/SimakItem');
const Photo = require('../models/Photo');
const User = require('../models/User');

const generatePDFReport = async (projectId, inspectionId, title, options = {}) => {
  try {
    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '../../uploads/reports');
    await fs.ensureDir(reportsDir);

    // Generate filename
    const timestamp = Date.now();
    const filename = `SLF_Report_${projectId}_${timestamp}.pdf`;
    const filePath = path.join(reportsDir, filename);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Pipe PDF to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add header
    await addReportHeader(doc, projectId, inspectionId);

    // Add project information
    await addProjectInformation(doc, projectId);

    // Add inspection details
    await addInspectionDetails(doc, inspectionId);

    // Add checklist responses
    await addChecklistResponses(doc, inspectionId);

    // Add simak responses
    await addSimakResponses(doc, inspectionId);

    // Add photo documentation
    await addPhotoDocumentation(doc, inspectionId);

    // Add conclusion
    await addConclusion(doc, projectId, inspectionId);

    // Add footer
    await addReportFooter(doc);

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', async () => {
        console.log(`📄 PDF report generated: ${filePath}`);
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        console.error('PDF generation error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Generate PDF report error:', error);
    throw error;
  }
};

const addReportHeader = async (doc, projectId, inspectionId) => {
  doc.fontSize(18).text('LAPORAN PEMERIKSAAN KELAIKAN FUNGSI', { align: 'center' });
  doc.fontSize(14).text('SERTIFIKAT LAIK FUNGSI (SLF)', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`ID Proyek: ${projectId}`, { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke();
  doc.moveDown();
};

const addProjectInformation = async (doc, projectId) => {
  const project = await Project.findByPk(projectId);
  if (!project) return;

  doc.fontSize(14).text('DATA PROYEK', { underline: true });
  doc.moveDown();

  const projectInfo = [
    { label: 'Nama Proyek', value: project.name },
    { label: 'Pemilik', value: project.owner_name },
    { label: 'Alamat', value: project.address },
    { label: 'Fungsi Bangunan', value: project.building_function },
    { label: 'Jumlah Lantai', value: project.floors.toString() },
    { label: 'Tinggi Bangunan', value: project.height ? `${project.height} meter` : '-' },
    { label: 'Luas Bangunan', value: project.area ? `${project.area} m²` : '-' },
    { label: 'Lokasi', value: project.location || '-' },
    { label: 'Koordinat', value: project.coordinates || '-' },
    { label: 'Jenis Permohonan SLF', value: project.request_type.replace(/_/g, ' ') }
  ];

  projectInfo.forEach(info => {
    doc.fontSize(10)
       .text(`${info.label}: ${info.value}`);
    doc.moveDown();
  });

  doc.moveDown();
};

const addInspectionDetails = async (doc, inspectionId) => {
  const inspection = await Inspection.findByPk(inspectionId);
  if (!inspection) return;

  doc.fontSize(14).text('DATA INSPEKSI', { underline: true });
  doc.moveDown();

  const inspectionInfo = [
    { label: 'Tanggal Inspeksi', value: inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString('id-ID') : '-' },
    { label: 'Status Inspeksi', value: inspection.status.replace(/_/g, ' ') },
    { label: 'Inspektor', value: inspection.inspector?.name || '-' },
    { label: 'Drafter', value: inspection.drafter?.name || '-' }
  ];

  inspectionInfo.forEach(info => {
    doc.fontSize(10)
       .text(`${info.label}: ${info.value}`);
    doc.moveDown();
  });

  doc.moveDown();
};

const addChecklistResponses = async (doc, inspectionId) => {
  const responses = await ChecklistResponse.findAll({
    where: { inspection_id: inspectionId },
    include: [{
      model: ChecklistItem,
      as: 'checklistItem',
      attributes: ['id', 'code', 'category', 'description', 'column_config']
    }],
    order: [['created_at', 'ASC']]
  });

  if (responses.length === 0) return;

  doc.fontSize(14).text('HASIL CHECKLIST PEMERIKSAAN', { underline: true });
  doc.moveDown();

  // Group by category
  const groupedResponses = {};
  responses.forEach(response => {
    const category = response.checklistItem?.category || 'Uncategorized';
    if (!groupedResponses[category]) {
      groupedResponses[category] = [];
    }
    groupedResponses[category].push(response);
  });

  Object.keys(groupedResponses).forEach((category, index) => {
    doc.fontSize(12).text(`${index + 1}. ${category.toUpperCase()}`, { bold: true });
    doc.moveDown();

    groupedResponses[category].forEach((response, itemIndex) => {
      doc.fontSize(10).text(`${itemIndex + 1}. [${response.checklistItem?.code}] ${response.checklistItem?.description}`);
      
      // Add response data
      if (response.response_data) {
        Object.keys(response.response_data).forEach(key => {
          const value = response.response_data[key];
          if (value !== null && value !== undefined && value !== '') {
            doc.fontSize(9).text(`   ${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`);
          }
        });
      }
      
      doc.moveDown();
    });

    doc.moveDown();
  });
};

const addSimakResponses = async (doc, inspectionId) => {
  const responses = await SimakResponse.findAll({
    where: { inspection_id: inspectionId },
    include: [{
      model: SimakItem,
      as: 'simakItem',
      attributes: ['id', 'code', 'category', 'description']
    }],
    order: [['created_at', 'ASC']]
  });

  if (responses.length === 0) return;

  doc.addPage();
  doc.fontSize(14).text('DAFTAR SIMAK', { underline: true });
  doc.moveDown();

  // Group by category
  const groupedResponses = {};
  responses.forEach(response => {
    const category = response.simakItem?.category || 'Uncategorized';
    if (!groupedResponses[category]) {
      groupedResponses[category] = [];
    }
    groupedResponses[category].push(response);
  });

  Object.keys(groupedResponses).forEach((category, index) => {
    doc.fontSize(12).text(`${index + 1}. ${category.toUpperCase()}`, { bold: true });
    doc.moveDown();

    groupedResponses[category].forEach((response, itemIndex) => {
      doc.fontSize(10).text(`${itemIndex + 1}. [${response.simakItem?.code}] ${response.simakItem?.description}`);
      
      // Add response data
      if (response.response_data) {
        Object.keys(response.response_data).forEach(key => {
          const value = response.response_data[key];
          if (value !== null && value !== undefined && value !== '') {
            doc.fontSize(9).text(`   ${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`);
          }
        });
      }
      
      doc.moveDown();
    });

    doc.moveDown();
  });
};

const addPhotoDocumentation = async (doc, inspectionId) => {
  const photos = await Photo.findAll({
    where: { inspection_id: inspectionId },
    include: [{
      model: User,
      as: 'uploader',
      attributes: ['id', 'name', 'email']
    }],
    order: [['created_at', 'ASC']]
  });

  if (photos.length === 0) return;

  doc.addPage();
  doc.fontSize(14).text('DOKUMENTASI FOTO', { underline: true });
  doc.moveDown();
  doc.fontSize(10).text(`Total Foto: ${photos.length} lembar`);
  doc.moveDown();

  photos.forEach((photo, index) => {
    doc.fontSize(9).text(`${index + 1}. ${photo.caption || `Foto dokumentasi`}`);
    if (photo.floor_info) {
      doc.text(`   Lantai: ${photo.floor_info}`);
    }
    if (photo.latitude && photo.longitude) {
      doc.text(`   Koordinat: ${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}`);
    }
    doc.text(`   Diunggah oleh: ${photo.uploader?.name || 'Unknown'}`);
    doc.text(`   Tanggal: ${new Date(photo.created_at).toLocaleDateString('id-ID')}`);
    doc.moveDown();
  });
};

const addConclusion = async (doc, projectId, inspectionId) => {
  doc.addPage();
  doc.fontSize(14).text('KESIMPULAN DAN REKOMENDASI', { underline: true });
  doc.moveDown();
  doc.fontSize(10);
  doc.text('Berdasarkan hasil pemeriksaan di lapangan, dapat disimpulkan bahwa:');
  doc.moveDown();
  doc.text('[Kesimpulan dan rekomendasi akan diisi oleh Drafter]');
  doc.moveDown();
  doc.text('Bangunan dinyatakan [LAIK/TIDAK LAIK] FUNGSI untuk digunakan sesuai dengan fungsi bangunan yang direncanakan.');
  doc.moveDown();
};

const addReportFooter = async (doc) => {
  doc.fontSize(8);
  doc.text('Laporan ini dibuat berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 27 Tahun 2018 dan Nomor 3 Tahun 2020', 50, doc.page.height - 50, { align: 'center' });
};

module.exports = {
  generatePDFReport,
  addReportHeader,
  addProjectInformation,
  addInspectionDetails,
  addChecklistResponses,
  addSimakResponses,
  addPhotoDocumentation,
  addConclusion,
  addReportFooter
};