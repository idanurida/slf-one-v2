// server/src/services/paymentService.js
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationService');

const verifyPayment = async (paymentId, adminLeadId, verificationData) => {
  try {
    const { status, rejection_reason } = verificationData;

    const payment = await Payment.findByPk(paymentId, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (status === 'verified') {
      await payment.update({
        status: 'verified',
        verified_by: adminLeadId,
        verified_at: new Date(),
        rejection_reason: null
      });

      // Kirim notifikasi ke Project Lead
      const projectLead = await User.findByPk(payment.project.project_lead_id);
      if (projectLead) {
        await createNotification(projectLead.id, 'Pembayaran Diverifikasi', `Pembayaran untuk proyek "${payment.project.name}" telah diverifikasi oleh Admin Lead.`, {
          priority: 'medium',
          actionRequired: false,
          actionUrl: `/dashboard/project-lead/projects/${payment.project_id}/payments`
        });
      }

      // Kirim notifikasi ke Klien
      const client = await User.findByPk(payment.project.client_id);
      if (client) {
        await createNotification(client.id, 'Pembayaran Diverifikasi', `Pembayaran untuk proyek "${payment.project.name}" telah diverifikasi.`, {
          priority: 'medium',
          actionRequired: false,
          actionUrl: `/dashboard/client/projects/${payment.project_id}/payments`
        });
      }

      return payment;
    } else if (status === 'rejected') {
      await payment.update({
        status: 'rejected',
        verified_by: adminLeadId,
        verified_at: new Date(),
        rejection_reason: rejection_reason || null
      });

      // Kirim notifikasi ke Klien
      const client = await User.findByPk(payment.project.client_id);
      if (client) {
        await createNotification(client.id, 'Pembayaran Ditolak', `Pembayaran untuk proyek "${payment.project.name}" ditolak. Alasan: ${rejection_reason || 'Tidak disebutkan'}`, {
          priority: 'high',
          actionRequired: true,
          actionUrl: `/dashboard/client/projects/${payment.project_id}/payments`
        });
      }

      return payment;
    } else {
      throw new Error('Invalid payment status');
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};

const getPaymentStatus = async (projectId) => {
  try {
    const payments = await Payment.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'DESC']]
    });

    const latestPayment = payments.length > 0 ? payments[0] : null;
    const verifiedPayments = payments.filter(p => p.status === 'verified');
    const rejectedPayments = payments.filter(p => p.status === 'rejected');
    const pendingPayments = payments.filter(p => p.status === 'pending');

    return {
      totalPayments: payments.length,
      verifiedPayments: verifiedPayments.length,
      rejectedPayments: rejectedPayments.length,
      pendingPayments: pendingPayments.length,
      latestPayment,
      allPayments: payments
    };
  } catch (error) {
    console.error('Get payment status error:', error);
    throw error;
  }
};

module.exports = {
  verifyPayment,
  getPaymentStatus
};