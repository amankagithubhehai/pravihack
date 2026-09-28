import express from 'express';
import { getAuditLogs, getNotifications, markNotificationRead } from '../controllers/auditNotificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/audit-logs', protect, authorize('Super Admin', 'Organization Admin', 'Auditor', 'Asset Manager'), getAuditLogs);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

export default router;
