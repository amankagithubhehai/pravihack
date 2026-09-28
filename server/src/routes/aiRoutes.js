import express from 'express';
import { getDocuments, createDocument, askAI } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/documents', protect, getDocuments);
router.post('/documents', protect, createDocument);
router.post('/chat', protect, askAI);

export default router;
