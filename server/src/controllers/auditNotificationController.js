import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

export const getAuditLogs = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { checkAndSyncWarrantyAlerts } from '../services/warrantyAlertService.js';

export const getNotifications = async (req, res) => {
  try {
    const io = req.app.get('io');
    await checkAndSyncWarrantyAlerts(io);

    let query = {};
    if (req.user.role !== 'Super Admin' && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
      query.$or = [{ userId: req.user._id }, { userId: null }];
    } else if (req.user.role === 'Super Admin') {
      // Super Admin sees system-wide alerts & unassigned broadcast alerts
      query.$or = [{ userId: req.user._id }, { userId: null }];
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
