// server/src/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (userId, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      priority: options.priority || 'medium',
      action_required: options.actionRequired || false,
      action_url: options.actionUrl || null,
      related_project_id: options.projectId || null,
      related_type: options.relatedType || null,
      related_id: options.relatedId || null,
      is_read: false
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

const createBulkNotifications = async (userIds, title, message, options = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      priority: options.priority || 'medium',
      action_required: options.actionRequired || false,
      action_url: options.actionUrl || null,
      related_project_id: options.projectId || null,
      related_type: options.relatedType || null,
      related_id: options.relatedId || null,
      is_read: false
    }));

    const createdNotifications = await Notification.bulkCreate(notifications);
    
    return createdNotifications;
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new Error('Not authorized to update this notification');
    }

    await notification.update({ is_read: true });

    return notification;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

const markAllAsRead = async (userId) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    return updatedCount;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new Error('Not authorized to delete this notification');
    }

    await notification.destroy();

    return true;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return count;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};