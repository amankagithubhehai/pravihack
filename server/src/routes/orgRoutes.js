import express from 'express';
import {
  getOrganizations,
  createOrganization,
  getDepartments,
  createDepartment,
} from '../controllers/orgController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/organizations', protect, getOrganizations);
router.post('/organizations', protect, authorize('Super Admin'), createOrganization);

router.get('/departments', protect, getDepartments);
router.post('/departments', protect, authorize('Super Admin', 'Organization Admin'), createDepartment);

export default router;
