import express from 'express';
import { getAssignments, createAssignment, returnAssignment } from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAssignments);
router.post('/', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), createAssignment);
router.put('/:id/return', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), returnAssignment);

export default router;
