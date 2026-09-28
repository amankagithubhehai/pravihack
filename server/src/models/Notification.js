import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for broadcast to org managers
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['INFO', 'WARNING', 'ALERT', 'SUCCESS', 'MAINTENANCE', 'WARRANTY'],
      default: 'INFO',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
