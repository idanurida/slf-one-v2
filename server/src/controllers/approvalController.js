// server/src/controllers/approvalController.js
const Approval = require('../models/Approval');
const Project = require('../models/Project');
const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Mendapatkan approval berdasarkan role pengguna
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getApprovalsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;

    // Validasi role
    const validRoles = ['project_lead', 'head_consultant', 'klien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for approval' });
    }

    // Verifikasi bahwa pengguna memiliki role yang benar
    if (req.user.role !== role) {
      return res.status(403).json({ error: `You are not authorized as ${role}` });
    }

    // Ambil approval berdasarkan role
    const approvals = await Approval.findAll({
      where: {
        role: role,
        user_id: userId,
        status: 'pending'
      },
      include: [
        {
          model: Project,
          attributes: ['id', 'name', 'owner_name', 'address', 'building_function']
        },
        {
          model: Report,
          attributes: ['id', 'title', 'status', 'file_path']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(approvals);
  } catch (error) {
    console.error('Get approvals by role error:', error);
    res.status(500).json({ error: 'Server error while fetching approvals' });
  }
};

/**
 * Mendapatkan approval berdasarkan project ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getProjectApprovals = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verifikasi project
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Ambil semua approval untuk project ini
    const approvals = await Approval.findAll({
      where: {
        project_id: projectId
      },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Report,
          attributes: ['id', 'title', 'status', 'file_path']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json(approvals);
  } catch (error) {
    console.error('Get project approvals error:', error);
    res.status(500).json({ error: 'Server error while fetching project approvals' });
  }
};

/**
 * Memberikan approval oleh role tertentu
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.approveByRole = async (req, res) => {
  try {
    const { projectId, role } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    // Validasi role
    const validRoles = ['project_lead', 'head_consultant', 'klien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for approval' });
    }

    // Verifikasi bahwa pengguna memiliki role yang benar
    if (req.user.role !== role) {
      return res.status(403).json({ error: `You are not authorized as ${role}` });
    }

    // Verifikasi project
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Cek apakah sudah ada approval dari role ini untuk project ini
    const existingApproval = await Approval.findOne({
      where: {
        project_id: projectId,
        role: role,
        status: 'approved'
      }
    });

    if (existingApproval) {
      return res.status(400).json({ error: `Approval by ${role} already exists for this project` });
    }

    // Buat approval baru
    const approval = await Approval.create({
      project_id: parseInt(projectId),
      user_id: userId,
      role: role,
      status: 'approved',
      comment: comment || null,
      approved_at: new Date()
    });

    // Update project status berdasarkan role
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

    await project.update(updateData);

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
        nextUserId = project.client_id;
        break;
      case 'klien':
        nextRole = null;
        // Project selesai atau dikirim ke pemerintah
        break;
    }

    if (nextRole && nextUserId) {
      await Notification.create({
        user_id: nextUserId,
        title: 'Project Approval Required',
        message: `Project "${project.name}" requires your ${nextRole} approval.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/${nextRole.replace(/_/g, '-')}/projects/${projectId}`
      });
    }

    res.json({
      message: `Project successfully approved by ${role}`,
      approval
    });
  } catch (error) {
    console.error('Approve by role error:', error);
    res.status(500).json({ error: 'Server error while approving project' });
  }
};

/**
 * Menolak approval oleh role tertentu
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.rejectByRole = async (req, res) => {
  try {
    const { projectId, role } = req.params;
    const { comment, rejection_reason } = req.body;
    const userId = req.user.id;

    // Validasi role
    const validRoles = ['project_lead', 'head_consultant', 'klien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for rejection' });
    }

    // Verifikasi bahwa pengguna memiliki role yang benar
    if (req.user.role !== role) {
      return res.status(403).json({ error: `You are not authorized as ${role}` });
    }

    // Verifikasi project
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Cek apakah sudah ada approval dari role ini untuk project ini
    const existingApproval = await Approval.findOne({
      where: {
        project_id: projectId,
        role: role,
        status: 'rejected'
      }
    });

    if (existingApproval) {
      return res.status(400).json({ error: `Rejection by ${role} already exists for this project` });
    }

    // Buat approval dengan status rejected
    const approval = await Approval.create({
      project_id: parseInt(projectId),
      user_id: userId,
      role: role,
      status: 'rejected',
      comment: comment || null,
      rejection_reason: rejection_reason || null,
      rejected_at: new Date()
    });

    // Update project status berdasarkan role
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
        break;
    }

    await project.update(updateData);

    // Kirim notifikasi ke role sebelumnya
    let previousRole = null;
    let previousUserId = null;
    switch (role) {
      case 'project_lead':
        previousRole = 'drafter';
        previousUserId = project.drafter_id;
        break;
      case 'head_consultant':
        previousRole = 'project_lead';
        previousUserId = project.project_lead_id;
        break;
      case 'klien':
        previousRole = 'head_consultant';
        const headConsultant = await User.findOne({ where: { role: 'head_consultant' } });
        previousUserId = headConsultant ? headConsultant.id : null;
        break;
    }

    if (previousRole && previousUserId) {
      await Notification.create({
        user_id: previousUserId,
        title: 'Project Rejected',
        message: `Project "${project.name}" was rejected by ${role}. Reason: ${rejection_reason || 'No reason provided'}`,
        priority: 'high',
        action_required: true,
        action_url: `/dashboard/${previousRole.replace(/_/g, '-')}/projects/${projectId}`
      });
    }

    res.json({
      message: `Project rejected by ${role}`,
      approval
    });
  } catch (error) {
    console.error('Reject by role error:', error);
    res.status(500).json({ error: 'Server error while rejecting project' });
  }
};

/**
 * Mendapatkan status approval untuk project
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getApprovalStatus = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verifikasi project
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Ambil semua approval untuk project ini
    const approvals = await Approval.findAll({
      where: {
        project_id: projectId
      },
      include: [{
        model: User,
        as: 'approver',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['created_at', 'ASC']]
    });

    // Buat summary status
    const statusSummary = {
      project_lead: approvals.find(a => a.role === 'project_lead'),
      head_consultant: approvals.find(a => a.role === 'head_consultant'),
      klien: approvals.find(a => a.role === 'klien')
    };

    res.json({
      project_status: project.status,
      approvals: statusSummary,
      all_approvals: approvals
    });
  } catch (error) {
    console.error('Get approval status error:', error);
    res.status(500).json({ error: 'Server error while fetching approval status' });
  }
};

module.exports = {
  getApprovalsByRole,
  getProjectApprovals,
  approveByRole,
  rejectByRole,
  getApprovalStatus
};