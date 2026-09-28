import express from 'express';
import {
  getMaintenance,
  createMaintenance,
  updateMaintenanceStatus,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMaintenance);
router.post('/', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), createMaintenance);
router.put('/:id', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), updateMaintenanceStatus);

export default router;
