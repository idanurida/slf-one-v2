// server/src/services/reportGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { format } = require('date-fns');
const { id: localeId } = require('date-fns/locale');

/**
 * Generate PDF report based on inspection data
 * @param {object} project - Project data
 * @param {object} inspection - Inspection data
 * @param {Array} checklistResponses - Checklist responses
 * @param {Array} simakResponses - Simak responses
 * @param {Array} photos - Photo documentation
 * @param {object} options - Report options
 * @returns {Promise<string>} - File path of generated report
 */
exports.generatePDFReport = async (project, inspection, checklistResponses, simakResponses, photos, options = {}) => {
  try {
    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '../../uploads/reports');
    await fs.ensureDir(reportsDir);

    // Generate filename
    const timestamp = Date.now();
    const filename = `SLF_Report_${project.id}_${timestamp}.pdf`;
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
    await this.addReportHeader(doc, project, inspection);

    // Add project information
    await this.addProjectInformation(doc, project);

    // Add inspection details
    await this.addInspectionDetails(doc, inspection);

    // Add checklist responses
    await this.addChecklistResponses(doc, checklistResponses);

    // Add simak responses
    await this.addSimakResponses(doc, simakResponses);

    // Add photo documentation
    await this.addPhotoDocumentation(doc, photos);

    // Add conclusion
    await this.addConclusion(doc, project, inspection);

    // Add footer
    await this.addReportFooter(doc);

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
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

/**
 * Generate DOCX report
 * @param {object} project - Project data
 * @param {object} inspection - Inspection data
 * @param {Array} checklistResponses - Checklist responses
 * @param {Array} simakResponses - Simak responses
 * @param {Array} photos - Photo documentation
 * @param {object} options - Report options
 * @returns {Promise<string>} - File path of generated report
 */
exports.generateDOCXReport = async (project, inspection, checklistResponses, simakResponses, photos, options = {}) => {
  try {
    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, '../../uploads/reports');
    await fs.ensureDir(reportsDir);

    // Generate filename
    const timestamp = Date.now();
    const filename = `SLF_Report_${project.id}_${timestamp}.docx`;
    const filePath = path.join(reportsDir, filename);

    // Create DOCX content (simplified approach using template literals)
    const docxContent = await this.createDOCXContent(
      project,
      inspection,
      checklistResponses,
      simakResponses,
      photos
    );

    // Write to file
    await fs.writeFile(filePath, docxContent);

    console.log(`📄 DOCX report generated: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Generate DOCX report error:', error);
    throw error;
  }
};

/**
 * Add report header
 * @param {PDFDocument} doc 
 * @param {object} project 
 * @param {object} inspection 
 */
exports.addReportHeader = async (doc, project, inspection) => {
  doc.fontSize(18).text('LAPORAN PEMERIKSAAN KELAIKAN FUNGSI', { align: 'center' });
  doc.fontSize(14).text('SERTIFIKAT LAIK FUNGSI (SLF)', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`ID Proyek: ${project.id}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}`, { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke();
  doc.moveDown();
};

/**
 * Add project information
 * @param {PDFDocument} doc 
 * @param {object} project 
 */
exports.addProjectInformation = async (doc, project) => {
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

/**
 * Add inspection details
 * @param {PDFDocument} doc 
 * @param {object} inspection 
 */
exports.addInspectionDetails = async (doc, inspection) => {
  if (inspection) {
    doc.fontSize(14).text('DATA INSPEKSI', { underline: true });
    doc.moveDown();

    const inspectionInfo = [
      { label: 'Tanggal Inspeksi', value: inspection.scheduled_date ? format(new Date(inspection.scheduled_date), 'dd MMMM yyyy', { locale: localeId }) : '-' },
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
  }
};

/**
 * Add checklist responses
 * @param {PDFDocument} doc 
 * @param {Array} checklistResponses 
 */
exports.addChecklistResponses = async (doc, checklistResponses) => {
  if (checklistResponses && checklistResponses.length > 0) {
    doc.fontSize(14).text('HASIL CHECKLIST PEMERIKSAAN', { underline: true });
    doc.moveDown();

    // Group by category
    const groupedResponses = {};
    checklistResponses.forEach(response => {
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
  }
};

/**
 * Add simak responses
 * @param {PDFDocument} doc 
 * @param {Array} simakResponses 
 */
exports.addSimakResponses = async (doc, simakResponses) => {
  if (simakResponses && simakResponses.length > 0) {
    doc.addPage();
    doc.fontSize(14).text('DAFTAR SIMAK', { underline: true });
    doc.moveDown();

    // Group by category
    const groupedSimak = {};
    simakResponses.forEach(response => {
      const category = response.simakItem?.category || 'Uncategorized';
      if (!groupedSimak[category]) {
        groupedSimak[category] = [];
      }
      groupedSimak[category].push(response);
    });

    Object.keys(groupedSimak).forEach((category, index) => {
      doc.fontSize(12).text(`${index + 1}. ${category.toUpperCase()}`, { bold: true });
      doc.moveDown();

      groupedSimak[category].forEach((response, itemIndex) => {
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
  }
};

/**
 * Add photo documentation
 * @param {PDFDocument} doc 
 * @param {Array} photos 
 */
exports.addPhotoDocumentation = async (doc, photos) => {
  if (photos && photos.length > 0) {
    doc.addPage();
    doc.fontSize(14).text('DOKUMENTASI FOTO', { underline: true });
    doc.moveDown();

    doc.fontSize(10).text(`Total Foto: ${photos.length} lembar`);
    doc.moveDown();

    photos.forEach((photo, index) => {
      doc.fontSize(9).text(`${index + 1}. ${photo.caption || `Foto ${index + 1}`}`);
      if (photo.floor_info) {
        doc.text(`   Lantai: ${photo.floor_info}`);
      }
      if (photo.latitude && photo.longitude) {
        doc.text(`   Koordinat: ${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}`);
      }
      doc.text(`   Diunggah oleh: ${photo.uploader?.name || 'Unknown'}`);
      doc.text(`   Tanggal: ${format(new Date(photo.created_at), 'dd MMMM yyyy HH:mm', { locale: localeId })}`);
      doc.moveDown();
    });
  }
};

/**
 * Add conclusion
 * @param {PDFDocument} doc 
 * @param {object} project 
 * @param {object} inspection 
 */
exports.addConclusion = async (doc, project, inspection) => {
  doc.addPage();
  doc.fontSize(14).text('KESIMPULAN DAN REKOMENDASI', { underline: true });
  doc.moveDown();

  doc.fontSize(10).text('Berdasarkan hasil pemeriksaan di lapangan, dapat disimpulkan bahwa:');
  doc.moveDown();
  doc.text('Bangunan dinyatakan [LAIK/TIDAK LAIK] FUNGSI untuk digunakan sesuai dengan fungsi bangunan yang direncanakan.');
  doc.moveDown();
  doc.text('Rekomendasi:');
  doc.moveDown();
  doc.text('- [Lanjutkan ke tahap berikutnya]');
  doc.moveDown();
  doc.text('- [Perbaiki hal-hal yang diperlukan]');
  doc.moveDown();
};

/**
 * Add report footer
 * @param {PDFDocument} doc 
 */
exports.addReportFooter = async (doc) => {
  doc.fontSize(8).text('Laporan ini dibuat berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 27 Tahun 2018 dan Nomor 3 Tahun 2020.', 50, doc.page.height - 50, { align: 'center' });
};

/**
 * Create DOCX content
 * @param {object} project 
 * @param {object} inspection 
 * @param {Array} checklistResponses 
 * @param {Array} simakResponses 
 * @param {Array} photos 
 * @returns {string}
 */
exports.createDOCXContent = async (project, inspection, checklistResponses, simakResponses, photos) => {
  // This is a simplified version - in production, you might want to use docxtemplater or similar
  let content = `LAPORAN PEMERIKSAAN KELAIKAN FUNGSI
SERTIFIKAT LAIK FUNGSI (SLF)

DATA PROYEK
==========
Nama Proyek: ${project.name}
Pemilik: ${project.owner_name}
Alamat: ${project.address}
Fungsi Bangunan: ${project.building_function}
Jumlah Lantai: ${project.floors}
Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
Lokasi: ${project.location || '-'}
Koordinat: ${project.coordinates || '-'}
Jenis Permohonan SLF: ${project.request_type.replace(/_/g, ' ')}

`;

  if (inspection) {
    content += `DATA INSPEKSI
===========
Tanggal Inspeksi: ${inspection.scheduled_date ? format(new Date(inspection.scheduled_date), 'dd MMMM yyyy', { locale: localeId }) : '-'}
Status Inspeksi: ${inspection.status.replace(/_/g, ' ')}
Inspektor: ${inspection.inspector?.name || '-'}
Drafter: ${inspection.drafter?.name || '-'}

`;
  }

  if (checklistResponses && checklistResponses.length > 0) {
    content += `HASIL CHECKLIST PEMERIKSAAN
=======================
`;
    
    const groupedResponses = {};
    checklistResponses.forEach(response => {
      const category = response.checklistItem?.category || 'Uncategorized';
      if (!groupedResponses[category]) {
        groupedResponses[category] = [];
      }
      groupedResponses[category].push(response);
    });

    Object.keys(groupedResponses).forEach((category, index) => {
      content += `${index + 1}. ${category.toUpperCase()}
`;
      
      groupedResponses[category].forEach((response, itemIndex) => {
        content += `   ${itemIndex + 1}. [${response.checklistItem?.code}] ${response.checklistItem?.description}
`;
        
        if (response.response_data) {
          Object.keys(response.response_data).forEach(key => {
            const value = response.response_data[key];
            if (value !== null && value !== undefined && value !== '') {
              content += `      ${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}
`;
            }
          });
        }
        
        content += `
`;
      });
      
      content += `
`;
    });
  }

  if (simakResponses && simakResponses.length > 0) {
    content += `DAFTAR SIMAK
===========
`;
    
    const groupedSimak = {};
    simakResponses.forEach(response => {
      const category = response.simakItem?.category || 'Uncategorized';
      if (!groupedSimak[category]) {
        groupedSimak[category] = [];
      }
      groupedSimak[category].push(response);
    });

    Object.keys(groupedSimak).forEach((category, index) => {
      content += `${index + 1}. ${category.toUpperCase()}
`;
      
      groupedSimak[category].forEach((response, itemIndex) => {
        content += `   ${itemIndex + 1}. [${response.simakItem?.code}] ${response.simakItem?.description}
`;
        
        if (response.response_data) {
          Object.keys(response.response_data).forEach(key => {
            const value = response.response_data[key];
            if (value !== null && value !== undefined && value !== '') {
              content += `      ${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}
`;
            }
          });
        }
        
        content += `
`;
      });
      
      content += `
`;
    });
  }

  if (photos && photos.length > 0) {
    content += `DOKUMENTASI FOTO
==============
Total Foto: ${photos.length} lembar

`;
    
    photos.forEach((photo, index) => {
      content += `${index + 1}. ${photo.caption || `Foto ${index + 1}`}
`;
      if (photo.floor_info) {
        content += `   Lantai: ${photo.floor_info}
`;
      }
      if (photo.latitude && photo.longitude) {
        content += `   Koordinat: ${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}
`;
      }
      content += `   Diunggah oleh: ${photo.uploader?.name || 'Unknown'}
`;
      content += `   Tanggal: ${format(new Date(photo.created_at), 'dd MMMM yyyy HH:mm', { locale: localeId })}
`;
      content += `
`;
    });
  }

  content += `KESIMPULAN DAN REKOMENDASI
=======================
Berdasarkan hasil pemeriksaan di lapangan, dapat disimpulkan bahwa:
Bangunan dinyatakan [LAIK/TIDAK LAIK] FUNGSI untuk digunakan sesuai dengan fungsi bangunan yang direncanakan.

Rekomendasi:
- [Lanjutkan ke tahap berikutnya]
- [Perbaiki hal-hal yang diperlukan]

Laporan ini dibuat berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 27 Tahun 2018 dan Nomor 3 Tahun 2020.

`;

  return content;
};

module.exports = exports;