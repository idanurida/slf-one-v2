// server/src/services/documentGenerator.js
const fs = require('fs-extra');
const path = require('path');
const { format } = require('date-fns');
const { id: localeId } = require('date-fns/locale');

/**
 * Generate document based on template and data
 * @param {string} templateType - Type of document template
 * @param {object} project - Project data
 * @param {object} data - Additional data for document
 * @returns {Promise<string>} - File path of generated document
 */
exports.generateDocument = async (templateType, project, data = {}) => {
  try {
    // Ensure documents directory exists
    const documentsDir = path.join(__dirname, '../../uploads/documents');
    await fs.ensureDir(documentsDir);

    // Generate filename based on template type
    const timestamp = Date.now();
    let filename = '';
    let fileExtension = 'pdf';
    
    switch (templateType) {
      case 'surat_permohonan_slf':
        filename = `Surat_Permohonan_SLF_${project.id}_${timestamp}.pdf`;
        break;
      case 'as_built_drawings':
        filename = `As_Built_Drawings_${project.id}_${timestamp}.pdf`;
        break;
      case 'krk':
        filename = `KRK_${project.id}_${timestamp}.pdf`;
        break;
      case 'imb_lama':
        filename = `IMB_Lama_${project.id}_${timestamp}.pdf`;
        break;
      case 'slf_lama':
        filename = `SLF_Lama_${project.id}_${timestamp}.pdf`;
        break;
      case 'status_tanah':
        filename = `Status_Tanah_${project.id}_${timestamp}.pdf`;
        break;
      case 'foto_lokasi':
        filename = `Foto_Lokasi_${project.id}_${timestamp}.pdf`;
        break;
      case 'quotation':
        filename = `Quotation_${project.id}_${timestamp}.pdf`;
        fileExtension = 'docx';
        break;
      case 'contract':
        filename = `Contract_${project.id}_${timestamp}.pdf`;
        fileExtension = 'docx';
        break;
      case 'spk':
        filename = `SPK_${project.id}_${timestamp}.pdf`;
        fileExtension = 'docx';
        break;
      case 'report':
        filename = `Report_${project.id}_${timestamp}.pdf`;
        fileExtension = 'pdf';
        break;
      case 'teknis_struktur':
        filename = `Teknis_Struktur_${project.id}_${timestamp}.pdf`;
        break;
      case 'teknis_arsitektur':
        filename = `Teknis_Arsitektur_${project.id}_${timestamp}.pdf`;
        break;
      case 'teknis_utilitas':
        filename = `Teknis_Utilitas_${project.id}_${timestamp}.pdf`;
        break;
      case 'teknis_sanitasi':
        filename = `Teknis_Sanitasi_${project.id}_${timestamp}.pdf`;
        break;
      default:
        filename = `Document_${templateType}_${project.id}_${timestamp}.${fileExtension}`;
    }

    const filePath = path.join(documentsDir, filename);

    // Create document content based on template type
    const documentContent = await this.createDocumentContent(templateType, project, data);

    // Write to file
    await fs.writeFile(filePath, documentContent);

    console.log(`📄 Document generated: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Generate document error:', error);
    throw error;
  }
};

/**
 * Create document content based on template type
 * @param {string} templateType 
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createDocumentContent = async (templateType, project, data = {}) => {
  // This is a simplified version - in production, you might want to use docxtemplater or similar
  let content = '';

  switch (templateType) {
    case 'surat_permohonan_slf':
      content = this.createSuratPermohonanSLF(project, data);
      break;
    case 'as_built_drawings':
      content = this.createAsBuiltDrawings(project, data);
      break;
    case 'krk':
      content = this.createKRK(project, data);
      break;
    case 'imb_lama':
      content = this.createIMBLama(project, data);
      break;
    case 'slf_lama':
      content = this.createSLFLama(project, data);
      break;
    case 'status_tanah':
      content = this.createStatusTanah(project, data);
      break;
    case 'foto_lokasi':
      content = this.createFotoLokasi(project, data);
      break;
    case 'quotation':
      content = this.createQuotation(project, data);
      break;
    case 'contract':
      content = this.createContract(project, data);
      break;
    case 'spk':
      content = this.createSPK(project, data);
      break;
    case 'report':
      content = this.createReport(project, data);
      break;
    case 'teknis_struktur':
      content = this.createTeknisStruktur(project, data);
      break;
    case 'teknis_arsitektur':
      content = this.createTeknisArsitektur(project, data);
      break;
    case 'teknis_utilitas':
      content = this.createTeknisUtilitas(project, data);
      break;
    case 'teknis_sanitasi':
      content = this.createTeknisSanitasi(project, data);
      break;
    default:
      content = this.createGenericDocument(templateType, project, data);
  }

  return content;
};

/**
 * Create Surat Permohonan SLF
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createSuratPermohonanSLF = (project, data = {}) => {
  return `SURAT PERMOHONAN PEMERIKSAAN KELAIKAN FUNGSI
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Kepada Yth.
Kepala Dinas Perumahan Rakyat dan Kawasan Permukiman
Provinsi/Kabupaten/Kota ${project.location || 'Jakarta'}

Dengan hormat,

Sehubungan dengan telah selesainya pembangunan bangunan gedung kami di alamat tersebut di atas, dengan ini kami mengajukan permohonan pemeriksaan kelaikan fungsi terhadap bangunan gedung tersebut.

Data bangunan:
1. Nama Bangunan: ${project.name}
2. Fungsi Bangunan: ${project.building_function}
3. Jumlah Lantai: ${project.floors}
4. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
5. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
6. Lokasi: ${project.location || '-'}
7. Koordinat: ${project.coordinates || '-'}

Demikian surat permohonan ini kami sampaikan. Atas perhatian dan bantuannya, kami ucapkan terima kasih.

Hormat kami,

${project.owner_name}
${project.owner_signature ? `[Tanda Tangan]` : ''}
${project.owner_position || 'Pemilik Bangunan'}

Lampiran:
1. Bukti Status Hak Atas Tanah
2. As-built drawings
3. KRK
4. IMB Lama (jika ada)
5. SLF Lama (jika ada)
6. Status Tanah
7. Foto Lokasi
8. Dokumen lainnya sesuai ketentuan
`;
};

/**
 * Create As-built Drawings
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createAsBuiltDrawings = (project, data = {}) => {
  return `AS-BUILT DRAWINGS
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Gambar As-built (terbangun) adalah gambar teknis yang menunjukkan kondisi aktual bangunan gedung setelah selesai dibangun.

Data teknis:
1. Fungsi Bangunan: ${project.building_function}
2. Jumlah Lantai: ${project.floors}
3. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
4. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
5. Lokasi: ${project.location || '-'}
6. Koordinat: ${project.coordinates || '-'}

Gambar As-built mencakup:
- Denah lantai
- Potongan bangunan
- Detail struktur
- Detail arsitektur
- Detail utilitas
- Foto dokumentasi

${data.drawings_notes || 'Catatan: Gambar as-built harus sesuai dengan kondisi aktual di lapangan.'}
`;
};

/**
 * Create KRK
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createKRK = (project, data = {}) => {
  return `KETERANGAN RENCANA KOTA (KRK)
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

KRK adalah dokumen yang menjelaskan rencana tata bangunan dan kota sesuai dengan Rencana Tata Ruang Wilayah (RTRW).

Data KRK:
1. Fungsi Bangunan: ${project.building_function}
2. Jumlah Lantai: ${project.floors}
3. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
4. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
5. Lokasi: ${project.location || '-'}
6. Koordinat: ${project.coordinates || '-'}

${data.krk_notes || 'KRK harus sesuai dengan ketentuan tata ruang yang berlaku.'}
`;
};

/**
 * Create IMB Lama
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createIMBLama = (project, data = {}) => {
  return `IJIN MENDIRIKAN BANGUNAN (IMB) LAMA
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

IMB Lama adalah dokumen legal yang menunjukkan bahwa bangunan telah memiliki izin mendirikan bangunan sebelumnya.

Data IMB Lama:
1. Nomor IMB: ${data.imb_number || '-'}
2. Tanggal IMB: ${data.imb_date ? format(new Date(data.imb_date), 'dd MMMM yyyy', { locale: localeId }) : '-'}
3. Fungsi Bangunan: ${project.building_function}
4. Jumlah Lantai: ${project.floors}
5. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
6. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
7. Lokasi: ${project.location || '-'}

${data.imb_notes || 'IMB Lama harus masih berlaku atau sesuai dengan ketentuan perpanjangan.'}
`;
};

/**
 * Create SLF Lama
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createSLFLama = (project, data = {}) => {
  return `SERTIFIKAT LAIK FUNGSI (SLF) LAMA
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

SLF Lama adalah dokumen legal yang menunjukkan bahwa bangunan sebelumnya telah memenuhi syarat laik fungsi.

Data SLF Lama:
1. Nomor SLF: ${data.slf_number || '-'}
2. Tanggal SLF: ${data.slf_date ? format(new Date(data.slf_date), 'dd MMMM yyyy', { locale: localeId }) : '-'}
3. Fungsi Bangunan: ${project.building_function}
4. Jumlah Lantai: ${project.floors}
5. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
6. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
7. Lokasi: ${project.location || '-'}

${data.slf_notes || 'SLF Lama harus masih berlaku atau sesuai dengan ketentuan perpanjangan.'}
`;
};

/**
 * Create Status Tanah
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createStatusTanah = (project, data = {}) => {
  return `STATUS HAK ATAS TANAH
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Status hak atas tanah adalah dokumen legal yang menunjukkan kepemilikan atau hak atas tanah tempat bangunan berdiri.

Data Status Tanah:
1. Jenis Hak: ${data.land_right_type || '-'}
2. Nomor Sertifikat: ${data.certificate_number || '-'}
3. Luas Tanah: ${data.land_area ? `${data.land_area} m²` : '-'}
4. Atas Nama: ${data.owner_name || project.owner_name}
5. Lokasi: ${project.location || '-'}
6. Koordinat: ${project.coordinates || '-'}

${data.land_notes || 'Status tanah harus jelas dan tidak bermasalah.'}
`;
};

/**
 * Create Foto Lokasi
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createFotoLokasi = (project, data = {}) => {
  return `FOTO LOKASI BANGUNAN GEDUNG
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Foto lokasi adalah dokumentasi visual dari kondisi bangunan gedung dan lingkungan sekitarnya.

Data Foto Lokasi:
1. Fungsi Bangunan: ${project.building_function}
2. Jumlah Lantai: ${project.floors}
3. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
4. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
5. Lokasi: ${project.location || '-'}
6. Koordinat: ${project.coordinates || '-'}

${data.photo_notes || 'Foto lokasi harus mencakup tampilan depan, samping, belakang, dan atas bangunan.'}
`;
};

/**
 * Create Quotation
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createQuotation = (project, data = {}) => {
  return `QUOTATION - PENAWARAN JASA PEMERIKSAAN SLF
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Kepada Yth.
${project.owner_name}
${project.address}

Dengan hormat,

Bersama surat ini, kami sampaikan penawaran jasa pemeriksaan kelaikan fungsi (SLF) untuk bangunan gedung Anda.

Rincian Penawaran:
1. Jenis Pemeriksaan: ${project.request_type.replace(/_/g, ' ')}
2. Fungsi Bangunan: ${project.building_function}
3. Jumlah Lantai: ${project.floors}
4. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
5. Lokasi: ${project.location || '-'}

Biaya Pemeriksaan:
- Biaya Inspeksi Lapangan: ${data.inspection_cost ? `Rp ${new Intl.NumberFormat('id-ID').format(data.inspection_cost)}` : '-'}
- Biaya Pembuatan Laporan: ${data.report_cost ? `Rp ${new Intl.NumberFormat('id-ID').format(data.report_cost)}` : '-'}
- Biaya Administrasi: ${data.admin_cost ? `Rp ${new Intl.NumberFormat('id-ID').format(data.admin_cost)}` : '-'}
- Total Biaya: ${data.total_cost ? `Rp ${new Intl.NumberFormat('id-ID').format(data.total_cost)}` : '-'}

Syarat & Ketentuan:
${data.terms_and_conditions || 'Syarat dan ketentuan akan dijelaskan lebih lanjut.'}

Demikian penawaran ini kami sampaikan. Atas perhatian dan pertimbangannya, kami ucapkan terima kasih.

Hormat kami,

[Nama Perusahaan]
[Jabatan]
[Tanda Tangan]
[Nama Lengkap]
[Nomor HP]
[Email]
`;
};

/**
 * Create Contract
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createContract = (project, data = {}) => {
  return `KONTRAK JASA PEMERIKSAAN SLF
${project.name}
${project.owner_name}
${project.address}

Nomor Kontrak: ${data.contract_number || 'KTR/SLF/' + Date.now()}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Antara:
1. ${data.consultant_company || '[Nama Perusahaan Konsultan]'}, yang beralamat di ${data.consultant_address || '[Alamat Perusahaan Konsultan]'}, selanjutnya disebut "KONSULTAN"
2. ${project.owner_name}, yang beralamat di ${project.address}, selanjutnya disebut "PEMOHON"

Pasal 1: RUANG LINGKUP PEKERJAAN
Konsultan akan melakukan pemeriksaan kelaikan fungsi (SLF) terhadap bangunan gedung Pemohon sesuai dengan ketentuan Permen PUPR No 27/2018 dan No 3/2020.

Pasal 2: SYARAT-SYARAT TEKNIS
Pemeriksaan akan dilakukan sesuai dengan checklist dan daftar simak yang telah ditetapkan dalam regulasi.

Pasal 3: BIAYA DAN PEMBAYARAN
Total biaya: ${data.total_cost ? `Rp ${new Intl.NumberFormat('id-ID').format(data.total_cost)}` : '-'}
Pembayaran: ${data.payment_terms || 'Sesuai dengan kesepakatan kedua belah pihak'}

Pasal 4: WAKTU PELAKSANAAN
Waktu pelaksanaan: ${data.duration || '30 hari kerja'} sejak kontrak ditandatangani.

Pasal 5: HAK DAN KEWAJIBAN
Hak dan kewajiban masing-masing pihak telah diatur dalam kontrak ini.

${data.contract_notes || 'Kontrak ini merupakan bagian dari dokumen legal yang mengikat kedua belah pihak.'}
`;
};

/**
 * Create SPK
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createSPK = (project, data = {}) => {
  return `SURAT PERINTAH KERJA (SPK)
${project.name}
${project.owner_name}
${project.address}

Nomor SPK: ${data.spk_number || 'SPK/SLF/' + Date.now()}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Diberikan kepada:
${data.consultant_company || '[Nama Perusahaan Konsultan]'}
${data.consultant_address || '[Alamat Perusahaan Konsultan]'}

Untuk melaksanakan pemeriksaan kelaikan fungsi (SLF) terhadap bangunan gedung:
${project.name}
${project.address}

Rincian Pekerjaan:
1. Pemeriksaan kelengkapan dokumen administratif
2. Pemeriksaan teknis sesuai checklist dan daftar simak
3. Pembuatan laporan hasil pemeriksaan
4. Pengiriman laporan ke instansi terkait

Waktu Pelaksanaan:
${data.start_date ? format(new Date(data.start_date), 'dd MMMM yyyy', { locale: localeId }) : '-'} 
s/d 
${data.end_date ? format(new Date(data.end_date), 'dd MMMM yyyy', { locale: localeId }) : '-'}

Biaya:
${data.total_cost ? `Rp ${new Intl.NumberFormat('id-ID').format(data.total_cost)}` : '-'}

Syarat & Ketentuan:
${data.terms_and_conditions || 'Sesuai dengan ketentuan yang berlaku.'}

${data.spk_notes || 'SPK ini merupakan perintah resmi dari Pemohon kepada Konsultan.'}
`;
};

/**
 * Create Report
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createReport = (project, data = {}) => {
  return `LAPORAN PEMERIKSAAN KELAIKAN FUNGSI
SERTIFIKAT LAIK FUNGSI (SLF)

${project.name}
${project.owner_name}
${project.address}

Tanggal Laporan: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

DATA PROYEK:
==========
1. Nama Proyek: ${project.name}
2. Pemilik: ${project.owner_name}
3. Alamat: ${project.address}
4. Fungsi Bangunan: ${project.building_function}
5. Jumlah Lantai: ${project.floors}
6. Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
7. Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
8. Lokasi: ${project.location || '-'}
9. Koordinat: ${project.coordinates || '-'}
10. Jenis Permohonan SLF: ${project.request_type.replace(/_/g, ' ')}

HASIL PEMERIKSAAN:
==============
${data.inspection_results || 'Hasil pemeriksaan akan dijelaskan dalam laporan ini.'}

KESIMPULAN:
=========
${data.conclusion || 'Berdasarkan hasil pemeriksaan, bangunan dinyatakan [LAIK/TIDAK LAIK] FUNGSI.'}

REKOMENDASI:
==========
${data.recommendations || 'Rekomendasi akan dijelaskan lebih lanjut dalam laporan ini.'}

Laporan ini dibuat berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 27 Tahun 2018 dan Nomor 3 Tahun 2020.
`;
};

/**
 * Create Teknis Struktur
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createTeknisStruktur = (project, data = {}) => {
  return `DOKUMEN TEKNIS STRUKTUR BANGUNAN GEDUNG
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Dokumen teknis struktur mencakup:
1. Gambar struktur (pondasi, kolom, balok, pelat, atap, tangga)
2. Spesifikasi material struktur
3. Hasil pengujian material struktur
4. Analisis struktur bangunan
5. Rekomendasi perbaikan (jika diperlukan)

${data.structure_notes || 'Dokumen teknis struktur harus sesuai dengan standar teknik yang berlaku.'}
`;
};

/**
 * Create Teknis Arsitektur
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createTeknisArsitektur = (project, data = {}) => {
  return `DOKUMEN TEKNIS ARSITEKTUR BANGUNAN GEDUNG
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Dokumen teknis arsitektur mencakup:
1. Gambar denah lantai
2. Gambar tampak depan, samping, belakang
3. Gambar potongan bangunan
4. Detail arsitektur
5. Spesifikasi finishing
6. Tata letak ruang

${data.architecture_notes || 'Dokumen teknis arsitektur harus sesuai dengan standar teknik yang berlaku.'}
`;
};

/**
 * Create Teknis Utilitas
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createTeknisUtilitas = (project, data = {}) => {
  return `DOKUMEN TEKNIS UTILITAS BANGUNAN GEDUNG
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Dokumen teknis utilitas mencakup:
1. Sistem kelistrikan
2. Sistem air bersih
3. Sistem drainase
4. Sistem telekomunikasi
5. Sistem gas (jika ada)
6. Sistem tata udara (HVAC)

${data.utilitas_notes || 'Dokumen teknis utilitas harus sesuai dengan standar teknik yang berlaku.'}
`;
};

/**
 * Create Teknis Sanitasi
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createTeknisSanitasi = (project, data = {}) => {
  return `DOKUMEN TEKNIS SANITASI BANGUNAN GEDUNG
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Dokumen teknis sanitasi mencakup:
1. Sistem air kotor
2. Sistem pengelolaan limbah
3. Sistem pengendalian kebisingan
4. Sistem pengendalian getaran
5. Sistem pencahayaan buatan
6. Sistem tata air

${data.sanitasi_notes || 'Dokumen teknis sanitasi harus sesuai dengan standar teknik yang berlaku.'}
`;
};

/**
 * Create Generic Document
 * @param {string} templateType 
 * @param {object} project 
 * @param {object} data 
 * @returns {string}
 */
exports.createGenericDocument = (templateType, project, data = {}) => {
  return `DOKUMEN ${templateType.toUpperCase()}
${project.name}
${project.owner_name}
${project.address}

Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: localeId })}

Template type: ${templateType}

Data project:
- Nama: ${project.name}
- Pemilik: ${project.owner_name}
- Alamat: ${project.address}
- Fungsi Bangunan: ${project.building_function}
- Jumlah Lantai: ${project.floors}
- Tinggi Bangunan: ${project.height ? `${project.height} meter` : '-'}
- Luas Bangunan: ${project.area ? `${project.area} m²` : '-'}
- Lokasi: ${project.location || '-'}
- Koordinat: ${project.coordinates || '-'}

${data.generic_notes || 'Dokumen ini dibuat sesuai dengan ketentuan yang berlaku.'}
`;
};

module.exports = exports;