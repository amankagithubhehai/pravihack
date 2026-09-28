import express from 'express';
import { register, login, getMe, getAllUsers, createUserByAdmin } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager', 'Auditor'), getAllUsers);
router.post('/users', protect, authorize('Super Admin'), createUserByAdmin);

export default router;
