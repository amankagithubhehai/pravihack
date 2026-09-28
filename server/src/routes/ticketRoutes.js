import express from 'express';
import { getTickets, createTicket, updateTicket } from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getTickets);
router.post('/', protect, createTicket);
router.put('/:id', protect, updateTicket);

export default router;
