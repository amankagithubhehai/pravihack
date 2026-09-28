import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedInitialData } from './seed.js';

import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import auditNotificationRoutes from './routes/auditNotificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io Connection Management
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Real-Time Socket: ${socket.id}`);

  socket.on('join_organization', (orgId) => {
    if (orgId) {
      socket.join(orgId);
      console.log(`Socket ${socket.id} joined room org:${orgId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', orgRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', auditNotificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AssetSphere AI',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5001;

// Connect DB & Launch
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🏛️ PRAVI State & National Public Physical Assets Registry running on port ${PORT}`);
  });
  seedInitialData(false).catch((err) => {
    console.error('Error during initial seed:', err);
  });
});
