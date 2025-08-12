// server/src/services/checklistService.js
const ChecklistItem = require('../models/ChecklistItem');
const ChecklistResponse = require('../models/ChecklistResponse');
const Inspection = require('../models/Inspection');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * Mendapatkan semua item checklist berdasarkan kategori dan jenis permohonan
 * @param {string} category - Kategori checklist (administrative, tata_bangunan, keandalan)
 * @param {string} applicableFor - Jenis permohonan (baru, existing, perubahan_fungsi, perpanjangan_slf, pascabencana)
 * @returns {Promise<Array>}
 */
exports.getChecklistItems = async (category, applicableFor) => {
  try {
    console.log(`🔍 Mengambil checklist items untuk kategori: ${category}, applicable_for: ${applicableFor}`);

    // Build where conditions
    const whereConditions = { 
      is_active: true,
      category: category
    };

    // Ambil semua item checklist untuk kategori ini
    let items = await ChecklistItem.findAll({
      where: whereConditions,
      order: [['code', 'ASC']]
    });

    console.log(`📄 Ditemukan ${items.length} item checklist untuk kategori ${category}`);

    // Filter berdasarkan applicable_for jika diberikan
    if (applicableFor) {
      items = items.filter(item => {
        // Jika applicable_for null/undefined, anggap berlaku untuk semua
        if (!item.applicable_for || item.applicable_for.length === 0) {
          return true;
        }
        // Cek apakah jenis permohonan ada dalam array applicable_for
        return item.applicable_for.includes(applicableFor);
      });
      
      console.log(`📊 Setelah filter applicable_for, tersisa ${items.length} item`);
    }

    return items;
  } catch (error) {
    console.error('❌ Get checklist items service error:', error);
    throw new Error('Gagal mengambil data checklist items: ' + error.message);
  }
};

/**
 * Mendapatkan item checklist berdasarkan ID
 * @param {number} id - ID checklist item
 * @returns {Promise<Object>}
 */
exports.getChecklistItemById = async (id) => {
  try {
    console.log(`🔍 Mengambil checklist item dengan ID: ${id}`);

    const item = await ChecklistItem.findByPk(id);
    if (!item) {
      throw new Error(`Checklist item dengan ID ${id} tidak ditemukan`);
    }

    console.log(`✅ Checklist item ditemukan: ${item.code}`);
    return item;
  } catch (error) {
    console.error('❌ Get checklist item by ID service error:', error);
    throw new Error('Gagal mengambil data checklist item: ' + error.message);
  }
};

/**
 * Menyimpan satu atau lebih respons checklist untuk sebuah inspeksi
 * @param {number} inspectionId - ID inspeksi
 * @param {Array} responses - Array of response objects
 * @param {number} userId - ID user yang menyimpan respons
 * @returns {Promise<Array>}
 */
exports.saveChecklistResponses = async (inspectionId, responses, userId) => {
  try {
    console.log(`💾 Menyimpan ${responses.length} checklist response untuk inspeksi ID: ${inspectionId}`);

    // Verifikasi inspeksi
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      throw new Error(`Inspeksi dengan ID ${inspectionId} tidak ditemukan`);
    }

    console.log(`📄 Inspeksi ditemukan: ${inspection.id}, Project ID: ${inspection.project_id}`);

    // Verifikasi project terkait
    const project = await Project.findByPk(inspection.project_id);
    if (!project) {
      throw new Error(`Project dengan ID ${inspection.project_id} tidak ditemukan`);
    }

    console.log(`🏢 Project ditemukan: ${project.name}`);

    // Siapkan array untuk bulk create
    const responsesToCreate = responses.map(response => {
      const { checklist_item_id, sample_number, response_data } = response;
      
      // Validasi input dasar
      if (!checklist_item_id) {
        throw new Error('Setiap response harus memiliki checklist_item_id');
      }

      return {
        inspection_id: parseInt(inspectionId),
        checklist_item_id: parseInt(checklist_item_id),
        sample_number: sample_number || null,
        response_ response_data || {},
        user_id: userId
      };
    });

    console.log(`📋 Menyiapkan ${responsesToCreate.length} respons untuk disimpan`);

    // Validasi bahwa setiap checklist_item_id valid
    const checklistItemIds = responsesToCreate.map(r => r.checklist_item_id);
    const checklistItems = await ChecklistItem.findAll({
      where: {
        id: checklistItemIds
      }
    });

    const validItemIds = new Set(checklistItems.map(item => item.id));
    const invalidItemIds = checklistItemIds.filter(id => !validItemIds.has(id));
    
    if (invalidItemIds.length > 0) {
      throw new Error(`Invalid checklist_item_id(s) found: ${invalidItemIds.join(', ')}`);
    }

    console.log(`✅ Semua checklist_item_id valid`);

    // Buat semua respons
    const createdResponses = await ChecklistResponse.bulkCreate(responsesToCreate);

    console.log(`✅ Berhasil menyimpan ${createdResponses.length} checklist response`);

    // Kirim notifikasi ke project lead
    if (project.project_lead_id) {
      await Notification.create({
        user_id: project.project_lead_id,
        title: 'Checklist Response Saved',
        message: `Respons checklist untuk inspeksi "${project.name}" telah disimpan oleh ${inspection.inspector?.name || 'inspektor'}.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/project-lead/inspections/${inspectionId}/checklist`
      });
      
      console.log(`🔔 Notifikasi dikirim ke Project Lead ID: ${project.project_lead_id}`);
    }

    return createdResponses;
  } catch (error) {
    console.error('❌ Save checklist responses service error:', error);
    throw new Error('Gagal menyimpan checklist responses: ' + error.message);
  }
};

/**
 * Mendapatkan semua respons checklist untuk sebuah inspeksi
 * @param {number} inspectionId - ID inspeksi
 * @returns {Promise<Array>}
 */
exports.getChecklistResponses = async (inspectionId) => {
  try {
    console.log(`🔍 Mengambil checklist responses untuk inspeksi ID: ${inspectionId}`);

    // Verifikasi inspeksi
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      throw new Error(`Inspeksi dengan ID ${inspectionId} tidak ditemukan`);
    }

    // Ambil semua respons untuk inspeksi ini dengan item checklist terkait
    const responses = await ChecklistResponse.findAll({
      where: {
        inspection_id: inspectionId
      },
      include: [
        {
          model: ChecklistItem,
          as: 'checklistItem',
          attributes: ['id', 'code', 'category', 'description', 'column_config']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    console.log(`📄 Ditemukan ${responses.length} checklist response untuk inspeksi ${inspectionId}`);

    return responses;
  } catch (error) {
    console.error('❌ Get checklist responses service error:', error);
    throw new Error('Gagal mengambil data checklist responses: ' + error.message);
  }
};

/**
 * Mengupdate respons checklist
 * @param {number} responseId - ID respons checklist
 * @param {Object} updateData - Data untuk diupdate
 * @param {number} userId - ID user yang melakukan update
 * @returns {Promise<Object>}
 */
exports.updateChecklistResponse = async (responseId, updateData, userId) => {
  try {
    console.log(`🔄 Mengupdate checklist response ID: ${responseId}`);

    const { response_data, sample_number } = updateData;

    // Cari respons
    const response = await ChecklistResponse.findByPk(responseId);
    if (!response) {
      throw new Error(`Checklist response dengan ID ${responseId} tidak ditemukan`);
    }

    console.log(`📄 Respons ditemukan, Inspection ID: ${response.inspection_id}`);

    // Update respons
    await response.update({
      response_ response_data || response.response_data,
      sample_number: sample_number || response.sample_number,
      user_id: userId, // Update user yang terakhir mengedit
      updated_at: new Date()
    });

    console.log(`✅ Respons checklist berhasil diupdate`);

    // Include checklist item data
    const updatedResponse = await ChecklistResponse.findByPk(responseId, {
      include: [
        {
          model: ChecklistItem,
          as: 'checklistItem',
          attributes: ['id', 'code', 'category', 'description', 'column_config']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    return updatedResponse;
  } catch (error) {
    console.error('❌ Update checklist response service error:', error);
    throw new Error('Gagal mengupdate checklist response: ' + error.message);
  }
};

/**
 * Menghapus respons checklist
 * @param {number} responseId - ID respons checklist
 * @returns {Promise<boolean>}
 */
exports.deleteChecklistResponse = async (responseId) => {
  try {
    console.log(`🗑️  Menghapus checklist response ID: ${responseId}`);

    // Cari respons
    const response = await ChecklistResponse.findByPk(responseId);
    if (!response) {
      throw new Error(`Checklist response dengan ID ${responseId} tidak ditemukan`);
    }

    // Hapus respons
    await response.destroy();

    console.log(`✅ Respons checklist berhasil dihapus`);

    return true;
  } catch (error) {
    console.error('❌ Delete checklist response service error:', error);
    throw new Error('Gagal menghapus checklist response: ' + error.message);
  }
};

/**
 * Memvalidasi respons checklist berdasarkan konfigurasi kolom
 * @param {Object} checklistItem - Item checklist dengan column_config
 * @param {Object} responseData - Data respons yang akan divalidasi
 * @returns {Object} - Objek dengan hasil validasi
 */
exports.validateChecklistResponse = async (checklistItem, responseData) => {
  try {
    console.log(`🔍 Memvalidasi respons untuk item: ${checklistItem.code}`);

    const validationErrors = [];
    const columnConfig = checklistItem.column_config;

    if (!columnConfig || !Array.isArray(columnConfig)) {
      return { isValid: true, errors: [] };
    }

    // Validasi setiap kolom berdasarkan konfigurasi
    for (const column of columnConfig) {
      const { name, type, required = false, options = [] } = column;
      const value = responseData[name];

      // Validasi required field
      if (required && (value === undefined || value === null || value === '')) {
        validationErrors.push(`Field ${name} wajib diisi`);
        continue;
      }

      // Validasi tipe data
      switch (type) {
        case 'radio':
          if (value && !options.includes(value)) {
            validationErrors.push(`Nilai ${name} tidak valid. Pilihan yang tersedia: ${options.join(', ')}`);
          }
          break;
          
        case 'radio_with_text':
          if (value && Array.isArray(value)) {
            const [radioVal, textVal] = value;
            if (radioVal && !options.includes(radioVal)) {
              validationErrors.push(`Nilai radio ${name} tidak valid. Pilihan yang tersedia: ${options.join(', ')}`);
            }
            // Jika 'Tidak Sesuai' dipilih, text harus diisi
            if (radioVal === 'Tidak Sesuai' && (!textVal || textVal.trim() === '')) {
              validationErrors.push(`Keterangan untuk ${name} wajib diisi ketika memilih 'Tidak Sesuai'`);
            }
          } else if (value && typeof value === 'string') {
            if (!options.includes(value)) {
              validationErrors.push(`Nilai radio ${name} tidak valid. Pilihan yang tersedia: ${options.join(', ')}`);
            }
          }
          break;
          
        case 'input_number':
          if (value && isNaN(parseFloat(value))) {
            validationErrors.push(`Nilai ${name} harus berupa angka`);
          }
          break;
          
        case 'textarea':
          // Tidak perlu validasi khusus untuk textarea
          break;
          
        default:
          // Tipe tidak dikenal, lewati validasi
          console.warn(`⚠️  Tipe kolom tidak dikenal: ${type} untuk field ${name}`);
      }
    }

    const isValid = validationErrors.length === 0;
    console.log(`✅ Validasi selesai. Hasil: ${isValid ? 'Valid' : 'Invalid dengan ' + validationErrors.length + ' error'}`);

    return {
      isValid,
      errors: validationErrors
    };
  } catch (error) {
    console.error('❌ Validate checklist response service error:', error);
    throw new Error('Gagal memvalidasi checklist response: ' + error.message);
  }
};

/**
 * Mendapatkan statistik checklist untuk sebuah inspeksi
 * @param {number} inspectionId - ID inspeksi
 * @returns {Promise<Object>}
 */
exports.getChecklistStats = async (inspectionId) => {
  try {
    console.log(`📊 Mengambil statistik checklist untuk inspeksi ID: ${inspectionId}`);

    // Verifikasi inspeksi
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      throw new Error(`Inspeksi dengan ID ${inspectionId} tidak ditemukan`);
    }

    // Hitung total checklist items untuk project ini
    const project = await Project.findByPk(inspection.project_id);
    if (!project) {
      throw new Error(`Project dengan ID ${inspection.project_id} tidak ditemukan`);
    }

    // Ambil semua checklist items yang applicable untuk jenis permohonan ini
    const allChecklistItems = await ChecklistItem.findAll({
      where: {
        is_active: true
      }
    });

    const applicableItems = allChecklistItems.filter(item => {
      if (!item.applicable_for || item.applicable_for.length === 0) {
        return true; // Berlaku untuk semua jenis
      }
      return item.applicable_for.includes(project.request_type);
    });

    // Ambil checklist responses yang sudah ada
    const existingResponses = await ChecklistResponse.findAll({
      where: {
        inspection_id: inspectionId
      }
    });

    // Hitung statistik
    const stats = {
      totalItems: applicableItems.length,
      completedItems: existingResponses.length,
      pendingItems: applicableItems.length - existingResponses.length,
      completionPercentage: applicableItems.length > 0 
        ? Math.round((existingResponses.length / applicableItems.length) * 100) 
        : 0
    };

    console.log(`📈 Statistik checklist:`, stats);

    return stats;
  } catch (error) {
    console.error('❌ Get checklist stats service error:', error);
    throw new Error('Gagal mengambil statistik checklist: ' + error.message);
  }
};

/**
 * Membuat template respons kosong untuk semua item checklist yang applicable
 * @param {number} inspectionId - ID inspeksi
 * @param {string} requestType - Jenis permohonan
 * @returns {Promise<Array>}
 */
exports.createEmptyChecklistResponses = async (inspectionId, requestType) => {
  try {
    console.log(`🆕 Membuat template respons kosong untuk inspeksi ID: ${inspectionId}, jenis: ${requestType}`);

    // Ambil semua checklist items yang applicable untuk jenis permohonan ini
    const allChecklistItems = await ChecklistItem.findAll({
      where: {
        is_active: true
      }
    });

    const applicableItems = allChecklistItems.filter(item => {
      if (!item.applicable_for || item.applicable_for.length === 0) {
        return true; // Berlaku untuk semua jenis
      }
      return item.applicable_for.includes(requestType);
    });

    console.log(`📄 Ditemukan ${applicableItems.length} item checklist yang applicable`);

    // Buat respons kosong untuk setiap item
    const emptyResponses = applicableItems.map(item => ({
      inspection_id: inspectionId,
      checklist_item_id: item.id,
      sample_number: null,
      response_ {},
      user_id: null
    }));

    // Bulk create jika belum ada
    const existingResponseIds = await ChecklistResponse.findAll({
      where: {
        inspection_id: inspectionId,
        checklist_item_id: applicableItems.map(item => item.id)
      },
      attributes: ['checklist_item_id']
    });

    const existingItemIds = new Set(existingResponseIds.map(r => r.checklist_item_id));
    const responsesToCreate = emptyResponses.filter(r => !existingItemIds.has(r.checklist_item_id));

    if (responsesToCreate.length > 0) {
      console.log(`💾 Membuat ${responsesToCreate.length} respons kosong...`);
      await ChecklistResponse.bulkCreate(responsesToCreate);
      console.log(`✅ Berhasil membuat template respons kosong`);
    } else {
      console.log(`ℹ️  Template respons sudah ada`);
    }

    // Ambil semua respons (termasuk yang sudah ada)
    const allResponses = await ChecklistResponse.findAll({
      where: {
        inspection_id: inspectionId
      },
      include: [{
        model: ChecklistItem,
        as: 'checklistItem',
        attributes: ['id', 'code', 'category', 'description', 'column_config', 'applicable_for']
      }],
      order: [['checklist_item_id', 'ASC']]
    });

    return allResponses;
  } catch (error) {
    console.error('❌ Create empty checklist responses service error:', error);
    throw new Error('Gagal membuat template respons kosong: ' + error.message);
  }
};

/**
 * Mendapatkan checklist items berdasarkan kategori proyek
 * @param {string} projectRequestType - Jenis permohonan proyek
 * @param {string} category - Kategori checklist
 * @returns {Promise<Array>}
 */
exports.getChecklistItemsByProjectType = async (projectRequestType, category) => {
  try {
    console.log(`🔍 Mengambil checklist items untuk proyek jenis: ${projectRequestType}, kategori: ${category}`);

    // Ambil semua checklist items untuk kategori ini
    const allItems = await ChecklistItem.findAll({
      where: {
        category: category,
        is_active: true
      },
      order: [['code', 'ASC']]
    });

    console.log(`📄 Ditemukan ${allItems.length} item checklist untuk kategori ${category}`);

    // Filter berdasarkan jenis permohonan proyek
    const filteredItems = allItems.filter(item => {
      // Jika tidak ada applicable_for, anggap berlaku untuk semua
      if (!item.applicable_for || item.applicable_for.length === 0) {
        return true;
      }
      // Cek apakah jenis permohonan proyek ada dalam applicable_for
      return item.applicable_for.includes(projectRequestType);
    });

    console.log(`📊 Setelah filter, tersisa ${filteredItems.length} item yang applicable`);

    return filteredItems;
  } catch (error) {
    console.error('❌ Get checklist items by project type service error:', error);
    throw new Error('Gagal mengambil checklist items berdasarkan jenis proyek: ' + error.message);
  }
};

/**
 * Mendapatkan ringkasan checklist untuk dashboard
 * @param {number} projectId - ID proyek
 * @returns {Promise<Object>}
 */
exports.getChecklistSummary = async (projectId) => {
  try {
    console.log(`📋 Mengambil ringkasan checklist untuk proyek ID: ${projectId}`);

    // Ambil project
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error(`Project dengan ID ${projectId} tidak ditemukan`);
    }

    // Ambil semua inspeksi untuk project ini
    const inspections = await Inspection.findAll({
      where: {
        project_id: projectId
      },
      order: [['scheduled_date', 'ASC']]
    });

    console.log(`🔍 Ditemukan ${inspections.length} inspeksi untuk proyek ${projectId}`);

    // Hitung statistik untuk setiap inspeksi
    const inspectionStats = [];
    for (const inspection of inspections) {
      const stats = await this.getChecklistStats(inspection.id);
      inspectionStats.push({
        inspection_id: inspection.id,
        scheduled_date: inspection.scheduled_date,
        status: inspection.status,
        checklist_stats: stats
      });
    }

    // Hitung statistik keseluruhan
    const totalItems = inspectionStats.reduce((sum, stat) => sum + stat.checklist_stats.totalItems, 0);
    const completedItems = inspectionStats.reduce((sum, stat) => sum + stat.checklist_stats.completedItems, 0);
    const pendingItems = inspectionStats.reduce((sum, stat) => sum + stat.checklist_stats.pendingItems, 0);

    const summary = {
      project_id: projectId,
      total_inspections: inspections.length,
      total_checklist_items: totalItems,
      completed_checklist_items: completedItems,
      pending_checklist_items: pendingItems,
      completion_percentage: totalItems > 0 
        ? Math.round((completedItems / totalItems) * 100) 
        : 0,
      inspection_details: inspectionStats
    };

    console.log(`📊 Ringkasan checklist:`, summary);

    return summary;
  } catch (error) {
    console.error('❌ Get checklist summary service error:', error);
    throw new Error('Gagal mengambil ringkasan checklist: ' + error.message);
  }
};

module.exports = exports;