// server/src/services/approvalService.js
const Approval = require('../models/Approval');
const Report = require('../models/Report');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationService');

const approveByRole = async (reportId, role, userId, comment = null) => {
  try {
    // Cek apakah approval sudah ada untuk role ini
    const existingApproval = await Approval.findOne({
      where: {
        report_id: reportId,
        role: role
      }
    });

    if (existingApproval) {
      throw new Error(`Approval by ${role} already exists`);
    }

    // Buat approval baru
    const approval = await Approval.create({
      report_id: reportId,
      user_id: userId,
      role: role,
      status: 'approved',
      comment: comment,
      approved_at: new Date()
    });

    // Update status report berdasarkan role
    const report = await Report.findByPk(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    let updateData = {};
    switch (role) {
      case 'project_lead':
        updateData.status = 'project_lead_approved';
        break;
      case 'head_consultant':
        updateData.status = 'head_consultant_approved';
        break;
      case 'klien':
        updateData.status = 'client_approved';
        updateData.client_approved_at = new Date();
        break;
    }

    await report.update(updateData);

    // Kirim notifikasi ke role berikutnya
    let nextRole = null;
    let nextUserId = null;
    switch (role) {
      case 'project_lead':
        nextRole = 'head_consultant';
        const headConsultant = await User.findOne({ where: { role: 'head_consultant' } });
        nextUserId = headConsultant ? headConsultant.id : null;
        break;
      case 'head_consultant':
        nextRole = 'klien';
        const project = await Project.findByPk(report.project_id);
        nextUserId = project ? project.client_id : null;
        break;
      case 'klien':
        nextRole = null;
        updateData.status = 'sent_to_government';
        updateData.sent_to_gov_at = new Date();
        break;
    }

    if (nextRole && nextUserId) {
      await createNotification(nextUserId, 'Laporan SLF Butuh Persetujuan', `Laporan "${report.title}" telah disetujui oleh ${role}. Silakan berikan persetujuan Anda.`, {
        priority: 'medium',
        actionRequired: true,
        actionUrl: `/dashboard/${nextRole}/reports/${reportId}`
      });
    }

    return approval;
  } catch (error) {
    console.error(`Approve by role ${role} error:`, error);
    throw error;
  }
};

const rejectByRole = async (reportId, role, userId, comment = null, rejectionReason = null) => {
  try {
    // Cek apakah approval sudah ada untuk role ini
    const existingApproval = await Approval.findOne({
      where: {
        report_id: reportId,
        role: role
      }
    });

    if (existingApproval) {
      throw new Error(`Approval by ${role} already exists`);
    }

    // Buat approval baru dengan status rejected
    const approval = await Approval.create({
      report_id: reportId,
      user_id: userId,
      role: role,
      status: 'rejected',
      comment: comment,
      rejection_reason: rejectionReason,
      rejected_at: new Date()
    });

    // Update status report berdasarkan role
    const report = await Report.findByPk(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    let updateData = {};
    switch (role) {
      case 'project_lead':
        updateData.status = 'project_lead_rejected';
        break;
      case 'head_consultant':
        updateData.status = 'head_consultant_rejected';
        break;
      case 'klien':
        updateData.status = 'client_rejected';
        updateData.client_rejected_at = new Date();
        updateData.client_rejection_reason = rejectionReason;
        break;
    }

    await report.update(updateData);

    // Kirim notifikasi ke role sebelumnya
    let previousRole = null;
    let previousUserId = null;
    switch (role) {
      case 'project_lead':
        previousRole = 'drafter';
        previousUserId = report.generated_by;
        break;
      case 'head_consultant':
        previousRole = 'project_lead';
        const projectLead = await User.findOne({ where: { role: 'project_lead' } });
        previousUserId = projectLead ? projectLead.id : null;
        break;
      case 'klien':
        previousRole = 'head_consultant';
        const headConsultant = await User.findOne({ where: { role: 'head_consultant' } });
        previousUserId = headConsultant ? headConsultant.id : null;
        break;
    }

    if (previousRole && previousUserId) {
      await createNotification(previousUserId, 'Laporan SLF Ditolak', `Laporan "${report.title}" ditolak oleh ${role}. ${rejectionReason ? `Alasan: ${rejectionReason}` : ''}`, {
        priority: 'high',
        actionRequired: true,
        actionUrl: `/dashboard/${previousRole}/reports/${reportId}`
      });
    }

    return approval;
  } catch (error) {
    console.error(`Reject by role ${role} error:`, error);
    throw error;
  }
};

const getApprovalStatus = async (reportId) => {
  try {
    const approvals = await Approval.findAll({
      where: { report_id: reportId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['created_at', 'ASC']]
    });

    const statusSummary = {
      project_lead: approvals.find(a => a.role === 'project_lead'),
      head_consultant: approvals.find(a => a.role === 'head_consultant'),
      klien: approvals.find(a => a.role === 'klien')
    };

    return {
      approvals: statusSummary,
      all_approvals: approvals
    };
  } catch (error) {
    console.error('Get approval status error:', error);
    throw error;
  }
};

module.exports = {
  approveByRole,
  rejectByRole,
  getApprovalStatus
};